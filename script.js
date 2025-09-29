document.getElementById("verificationForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const collegeId = document.getElementById("collegeId").value;
  const year = document.getElementById("year").value;
  const course = document.getElementById("course").value;

  // Mock verification (replace with DB/API check later)
  if (name && collegeId && year && course) {
    document.getElementById("resultMessage").innerText = "✅ Verification Successful!";
    document.getElementById("resultSection").classList.remove("hidden");
    document.getElementById("shareBtn").classList.remove("hidden");

    // Show share button click event
    document.getElementById("shareBtn").addEventListener("click", function() {
      const params = new URLSearchParams({
        name: name,
        collegeId: collegeId,
        year: year,
        course: course
      });

      const shareURL = `${window.location.origin}/share.html?${params.toString()}`;
      document.getElementById("shareLink").value = shareURL;
      document.getElementById("shareSection").classList.remove("hidden");
    });
  } else {
    document.getElementById("resultMessage").innerText = "❌ Verification Failed!";
    document.getElementById("resultSection").classList.remove("hidden");
    document.getElementById("shareBtn").classList.add("hidden");
  }
});

function copyLink() {
  const shareInput = document.getElementById("shareLink");
  shareInput.select();
  document.execCommand("copy");

  // Show popup
  const popup = document.getElementById("popup");
  popup.classList.add("show");
  popup.classList.remove("hidden");

  // Hide after 2 seconds
  setTimeout(() => {
    popup.classList.remove("show");
    popup.classList.add("hidden");
  }, 2000);
}
