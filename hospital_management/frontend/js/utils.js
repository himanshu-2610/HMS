// Format date to readable string
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Show loading spinner
  function showLoading(element) {
    element.innerHTML = '<div class="spinner"></div>';
  }
  
  // Hide loading spinner
  function hideLoading(element, content) {
    element.textContent = content;
  }
  
  // Show modal
  function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
  }
  
  // Hide modal
  function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }
  
  // Debounce function for search inputs
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  // Add spinner CSS dynamically
  const spinnerCSS = `
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid var(--primary);
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  `;
  
  const style = document.createElement('style');
  style.innerHTML = spinnerCSS;
  document.head.appendChild(style);