// ===== Section Switching =====
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

function showRegister() {
  showSection('register-section');
}

function showLogin() {
  showSection('login-section');
}

// ===== Logout =====
function logout() {
  showSection('login-section');
}

// ===== Credential Helpers =====
function loadCredentials(){
  return JSON.parse(localStorage.getItem('credentials')) || {
    student: [{ username:"student", password:"student123" } ],
    university: [{ username:"uni", password:"uni123" }],
    admin: [{ username:"admin", password:"admin123" }]
  };
}

function saveCredentials(creds){
  localStorage.setItem('credentials', JSON.stringify(creds));
}

function addUser(userType, username, password){
  const creds = loadCredentials();
  creds[userType] = creds[userType] || [];

  // prevent duplicate usernames in same role
  if(creds[userType].some(u => u.username === username)){
    return { success:false, message:"Username already exists for this role!" };
  }

  creds[userType].push({ username, password });
  saveCredentials(creds);
  return { success:true, message:"User registered successfully!" };
}

// ===== Login Logic =====
document.getElementById('loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const userType = document.getElementById('userType').value;
  const loginError = document.getElementById('loginError');

  const credentials = loadCredentials();
  let validUser = false;

  if(userType && credentials[userType]){
    validUser = credentials[userType].some(
      u => u.username === username && u.password === password
    );
  }

  if(validUser){
    loginError.textContent = '';
    if(userType === 'student')
      {
      showSection('student-section');
      renderStudentCertificates();
    } 
    else if(userType === 'university')
      {
      showSection('university-section');
      renderRequests();
    } 
    else if (userType == 'admin') 
      {
      showSection('admin-section');
      renderAdminDashboard();
    }
  } else {
    loginError.textContent = "Invalid credentials!";
  }
});

// ===== Register Logic =====
document.getElementById('registerForm').addEventListener('submit', function(e){
  e.preventDefault();
  const userType = document.getElementById('regUserType').value;
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const msg = document.getElementById('registerError'); // FIXED

  if(!username || !password || !userType){
    msg.style.color = 'red';
    msg.textContent = "Please fill all fields.";
    return;
  }

  const result = addUser(userType, username, password);
  if(result.success){
    msg.style.color = 'green';
    msg.textContent = result.message;
    document.getElementById('registerForm').reset();
  } else {
    msg.style.color = 'red';
    msg.textContent = result.message;
  }
});

// ===== Admin Dashboard =====
function renderAdminDashboard() {
  renderAdminUsers();
  renderAdminCertificates();
}

// Show all users
function renderAdminUsers() {
  const creds = loadCredentials();
  const container = document.getElementById('adminUsers');
  container.innerHTML = '';

  for (let role in creds) {
    const roleDiv = document.createElement('div');
    roleDiv.className = 'admin-role';
    roleDiv.innerHTML = `<h4>${role.toUpperCase()}</h4>`;
    creds[role].forEach(u => {
      roleDiv.innerHTML += `<p>👤 ${u.username}</p>`;
    });
    container.appendChild(roleDiv);
  }
}

// Show all certificates
function renderAdminCertificates() {
  const certificates = JSON.parse(localStorage.getItem('certificates')) || [];
  const container = document.getElementById('adminCertificates');
  container.innerHTML = '';

  if (certificates.length === 0) {
    container.innerHTML = '<p>No certificates uploaded yet.</p>';
    return;
  }

  certificates.forEach(cert => {
    const card = document.createElement('div');
    card.className = 'admin-cert';
    card.innerHTML = `
      <p><strong>Name:</strong> ${cert.name}</p>
      <p><strong>Roll No:</strong> ${cert.rollNo}</p>
      <p><strong>Course:</strong> ${cert.course}</p>
      <p><strong>Status:</strong> ${cert.status}</p>
    `;
    container.appendChild(card);
  });
}

// Reset system
function resetSystem() {
  if(confirm("Are you sure you want to reset all data?")) {
    localStorage.clear();
    alert("System reset successfully!");
    showLogin();
  }
}


// ===== Student Portal: Upload Certificate =====
document.getElementById('uploadForm').addEventListener('submit', function(e){
  e.preventDefault();

  const name = document.getElementById('studentName').value.trim();
  const rollNo = document.getElementById('rollNo').value.trim();
  const course = document.getElementById('course').value.trim();
  const fileInput = document.getElementById('certificateFile');
  const file = fileInput.files[0];
  const statusDiv = document.getElementById('studentStatus');

  if(!name || !rollNo || !course || !file){
    statusDiv.style.color = 'red';
    statusDiv.textContent = 'Please fill all fields and select a file.';
    return;
  }

  let certificates = JSON.parse(localStorage.getItem('certificates')) || [];
  certificates.push({ name, rollNo, course, fileName: file.name, status: 'pending' });
  localStorage.setItem('certificates', JSON.stringify(certificates));

  statusDiv.style.color = 'green';
  statusDiv.textContent = 'Certificate uploaded successfully!';
  document.getElementById('uploadForm').reset();

  renderStudentCertificates();
});

// ===== Render Student Certificates =====
function renderStudentCertificates() {
  const container = document.getElementById('studentCertificates');
  const certificates = JSON.parse(localStorage.getItem('certificates')) || [];
  container.innerHTML = '';

  certificates.forEach((cert, index) => {
    const card = document.createElement('div');
    card.className = 'cert-card';
    card.innerHTML = `
      <div>
        <p><strong>Course:</strong> ${cert.course}</p>
        <p><strong>Status:</strong> ${cert.status}</p>
      </div>
      <div>
        ${cert.status === 'approved' ? `<button class="view-btn" data-index="${index}">View QR</button>` : ''}
      </div>
    `;
    container.appendChild(card);
  });

  // QR button click
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function(){
      const index = this.getAttribute('data-index');
      const cert = JSON.parse(localStorage.getItem('certificates'))[index];
      generateStudentQR(cert);
    });
  });
}

// ===== Generate QR for Student =====
function generateStudentQR(cert){
  const qrData = `Name: ${cert.name}\nRoll No: ${cert.rollNo}\nCourse: ${cert.course}\nStatus: ${cert.status}`;
  QRCode.toCanvas(qrData, { width: 150 }, function (err, canvas) {
    if(err) console.error(err);
    const popup = window.open('', 'QR Code', 'width=200,height=250');
    popup.document.write('<h3>Certificate QR</h3>');
    popup.document.body.appendChild(canvas);
  });
}

// ===== University Portal: Approve/Reject Certificates =====
const requestsDiv = document.getElementById('requests');

function renderRequests() {
  let certificates = JSON.parse(localStorage.getItem('certificates')) || [];
  requestsDiv.innerHTML = '';

  certificates.forEach((cert, index) => {
    const card = document.createElement('div');
    card.className = 'request-card';
    card.innerHTML = `
      <div class="request-info">
        <p><strong>Name:</strong> ${cert.name}</p>
        <p><strong>Roll No:</strong> ${cert.rollNo}</p>
        <p><strong>Course:</strong> ${cert.course}</p>
        <p><strong>Status:</strong> ${cert.status}</p>
      </div>
      <div>
        ${cert.status === 'pending' ? `
          <button class="approve-btn" data-index="${index}">Approve</button>
          <button class="reject-btn" data-index="${index}">Reject</button>` : ''}
      </div>
    `;
    requestsDiv.appendChild(card);
  });

  document.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', function(){
      const index = this.getAttribute('data-index');
      updateCertificateStatus(index, 'approved');
    });
  });

  document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', function(){
      const index = this.getAttribute('data-index');
      updateCertificateStatus(index, 'rejected');
    });
  });
}

// ===== Update Certificate Status =====
function updateCertificateStatus(index, status){
  let certificates = JSON.parse(localStorage.getItem('certificates'));
  certificates[index].status = status;
  localStorage.setItem('certificates', JSON.stringify(certificates));
  renderRequests();
  renderStudentCertificates();
}

// ===== Auto-refresh when active =====
setInterval(() => {
  if(document.getElementById('university-section').classList.contains('active')){
    renderRequests();
  }
  if(document.getElementById('student-section').classList.contains('active')){
    renderStudentCertificates();
  }
}, 1000);
