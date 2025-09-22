// ===== Section Switching =====
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

// ===== Logout =====
function logout() {
  showSection('login-section');
}

// ===== Login Logic =====
document.getElementById('loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const userType = document.getElementById('userType').value;
  const loginError = document.getElementById('loginError');

  // Simple demo credentials
  const credentials = {
    student: {username:"student", password:"student123"},
    university: {username:"uni", password:"uni123"},
    admin: {username:"admin", password:"admin123"}
  }

  if(userType && credentials[userType] && username === credentials[userType].username && password === credentials[userType].password){
    loginError.textContent = '';
    showSection(userType === 'student' ? 'student-section' : 'university-section');
    if(userType === 'student') renderStudentCertificates();
    if(userType === 'university') renderRequests();
  } else {
    loginError.textContent = "Invalid credentials!";
  }
});

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

// ===== Auto-render sections =====
setInterval(() => {
  if(document.getElementById('university-section').classList.contains('active')){
    renderRequests();
  }
  if(document.getElementById('student-section').classList.contains('active')){
    renderStudentCertificates();
  }
}, 1000);
