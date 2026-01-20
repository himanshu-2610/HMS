// // Toggle sidebar on mobile
// document.addEventListener('DOMContentLoaded', function() {
//     const menuToggle = document.querySelector('.menu-toggle');
//     const sidebar = document.querySelector('.sidebar');
//     const mainContent = document.querySelector('.main-content');
    
//     if (menuToggle && sidebar) {
//         menuToggle.addEventListener('click', function() {
//             sidebar.classList.toggle('active');
//             mainContent.classList.toggle('active');
//         });
//     }

//     // Initialize date pickers with min date as today
//     const dateInputs = document.querySelectorAll('input[type="date"]');
//     dateInputs.forEach(input => {
//         if (!input.value) {
//             const today = new Date();
//             const dd = String(today.getDate()).padStart(2, '0');
//             const mm = String(today.getMonth() + 1).padStart(2, '0');
//             const yyyy = today.getFullYear();
//             input.min = `${yyyy}-${mm}-${dd}`;
//         }
//     });

//     // Initialize time pickers
//     const timeInputs = document.querySelectorAll('input[type="time"]');
//     timeInputs.forEach(input => {
//         if (!input.value) {
//             const now = new Date();
//             const hours = now.getHours().toString().padStart(2, '0');
//             const minutes = now.getMinutes().toString().padStart(2, '0');
//             input.value = `${hours}:${minutes}`;
//         }
//     });

//     // Add animation to elements with fade-in class as they come into view
//     const fadeElements = document.querySelectorAll('.fade-in');
    
//     const fadeInObserver = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 entry.target.style.opacity = 1;
//                 entry.target.style.transform = 'translateY(0)';
//             }
//         });
//     }, { threshold: 0.1 });

//     fadeElements.forEach(element => {
//         element.style.opacity = 0;
//         element.style.transform = 'translateY(20px)';
//         element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
//         fadeInObserver.observe(element);
//     });

//     // Smooth scrolling for anchor links
//     document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//         anchor.addEventListener('click', function(e) {
//             e.preventDefault();
//             document.querySelector(this.getAttribute('href')).scrollIntoView({
//                 behavior: 'smooth'
//             });
//         });
//     });
// });

// // Form validation with better UX
// function validateForm(form) {
//     let isValid = true;
//     const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
//     requiredInputs.forEach(input => {
//         const formGroup = input.closest('.form-group');
//         if (!input.value.trim()) {
//             formGroup.classList.add('error');
//             isValid = false;
            
//             // Add error message if not already present
//             if (!formGroup.querySelector('.error-message')) {
//                 const errorMessage = document.createElement('p');
//                 errorMessage.className = 'error-message';
//                 errorMessage.textContent = 'This field is required';
//                 errorMessage.style.color = '#ef233c';
//                 errorMessage.style.fontSize = '0.85rem';
//                 errorMessage.style.marginTop = '0.25rem';
//                 formGroup.appendChild(errorMessage);
//             }
//         } else {
//             formGroup.classList.remove('error');
//             const errorMessage = formGroup.querySelector('.error-message');
//             if (errorMessage) {
//                 errorMessage.remove();
//             }
//         }
//     });

//     return isValid;
// }

// // Enhanced form validation with event listeners
// document.querySelectorAll('form').forEach(form => {
//     form.addEventListener('submit', function(e) {
//         if (!validateForm(this)) {
//             e.preventDefault();
            
//             // Show toast notification
//             showToast('Please fill in all required fields correctly', 'error');
            
//             // Scroll to first error
//             const firstError = this.querySelector('.error');
//             if (firstError) {
//                 firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
//             }
//         }
//     });

//     // Add real-time validation on blur
//     form.querySelectorAll('input, select, textarea').forEach(input => {
//         input.addEventListener('blur', function() {
//             const formGroup = this.closest('.form-group');
//             if (this.hasAttribute('required') && !this.value.trim()) {
//                 formGroup.classList.add('error');
                
//                 if (!formGroup.querySelector('.error-message')) {
//                     const errorMessage = document.createElement('p');
//                     errorMessage.className = 'error-message';
//                     errorMessage.textContent = 'This field is required';
//                     errorMessage.style.color = '#ef233c';
//                     errorMessage.style.fontSize = '0.85rem';
//                     errorMessage.style.marginTop = '0.25rem';
//                     formGroup.appendChild(errorMessage);
//                 }
//             } else {
//                 formGroup.classList.remove('error');
//                 const errorMessage = formGroup.querySelector('.error-message');
//                 if (errorMessage) {
//                     errorMessage.remove();
//                 }
//             }
//         });
//     });
// });

// // Enhanced toast notification system
// function showToast(message, type = 'success', duration = 3000) {
//     // Remove existing toasts
//     document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
//     const toast = document.createElement('div');
//     toast.className = `toast toast-${type}`;
//     toast.innerHTML = `
//         <div class="toast-icon">
//             ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
//               type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : 
//               '<i class="fas fa-info-circle"></i>'}
//         </div>
//         <div class="toast-message">${message}</div>
//     `;
    
//     document.body.appendChild(toast);
    
//     // Add styles dynamically
//     const toastStyles = document.createElement('style');
//     toastStyles.textContent = `
//         .toast {
//             position: fixed;
//             bottom: 30px;
//             right: 30px;
//             padding: 16px 24px;
//             border-radius: 12px;
//             color: white;
//             display: flex;
//             align-items: center;
//             gap: 12px;
//             box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
//             z-index: 1000;
//             transform: translateY(100px);
//             opacity: 0;
//             transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
//         }
//         .toast.show {
//             transform: translateY(0);
//             opacity: 1;
//         }
//         .toast-success {
//             background-color: #4cc9f0;
//         }
//         .toast-error {
//             background-color: #ef233c;
//         }
//         .toast-warning {
//             background-color: #f8961e;
//         }
//         .toast-icon {
//             font-size: 1.2rem;
//         }
//         .toast-message {
//             font-size: 0.95rem;
//             font-weight: 500;
//         }
//     `;
//     document.head.appendChild(toastStyles);
    
//     setTimeout(() => {
//         toast.classList.add('show');
//     }, 100);
    
//     setTimeout(() => {
//         toast.classList.remove('show');
//         setTimeout(() => {
//             toast.remove();
//             toastStyles.remove();
//         }, 400);
//     }, duration);
// }

// // Display toast if there's a success/error message in the URL
// const urlParams = new URLSearchParams(window.location.search);
// const successMessage = urlParams.get('success');
// const errorMessage = urlParams.get('error');

// if (successMessage) {
//     showToast(successMessage, 'success');
// }

// if (errorMessage) {
//     showToast(errorMessage, 'error');
// }

// // Dynamic active state for sidebar links
// const currentPath = window.location.pathname;
// const sidebarLinks = document.querySelectorAll('.sidebar-menu a');

// sidebarLinks.forEach(link => {
//     const linkPath = link.getAttribute('href');
    
//     // Check if the current path starts with the link path
//     if (currentPath.startsWith(linkPath)) {
//         link.classList.add('active');
        
//         // If it's a dropdown parent, open it
//         const parentMenu = link.closest('.has-submenu');
//         if (parentMenu) {
//             parentMenu.classList.add('open');
//         }
//     }
// });

// // Handle dropdown menus in sidebar
// document.querySelectorAll('.has-submenu > a').forEach(link => {
//     link.addEventListener('click', function(e) {
//         const submenu = this.nextElementSibling;
//         const parentItem = this.parentElement;
        
//         // Prevent default if it's a dropdown toggle
//         if (submenu && submenu.classList.contains('submenu')) {
//             e.preventDefault();
//             parentItem.classList.toggle('open');
//         }
//     });
// });

// // Responsive table enhancement
// document.querySelectorAll('.table-responsive').forEach(tableWrapper => {
//     // Add a container div for better scrolling
//     const container = document.createElement('div');
//     container.className = 'table-container';
//     tableWrapper.appendChild(container);
//     container.appendChild(tableWrapper.querySelector('table'));
    
//     // Add shadow indicators for horizontal scrolling
//     const leftShadow = document.createElement('div');
//     leftShadow.className = 'scroll-shadow left';
//     const rightShadow = document.createElement('div');
//     rightShadow.className = 'scroll-shadow right';
    
//     tableWrapper.appendChild(leftShadow);
//     tableWrapper.appendChild(rightShadow);
    
//     // Update shadows on scroll
//     container.addEventListener('scroll', function() {
//         const scrollLeft = this.scrollLeft;
//         const maxScroll = this.scrollWidth - this.clientWidth;
        
//         leftShadow.style.opacity = scrollLeft > 0 ? '1' : '0';
//         rightShadow.style.opacity = scrollLeft < maxScroll ? '1' : '0';
//     });
    
//     // Initial check
//     container.dispatchEvent(new Event('scroll'));
// });

// // Add styles for table enhancements
// const tableStyles = document.createElement('style');
// tableStyles.textContent = `
//     .table-container {
//         overflow-x: auto;
//         scroll-behavior: smooth;
//     }
//     .scroll-shadow {
//         position: absolute;
//         top: 0;
//         bottom: 0;
//         width: 30px;
//         pointer-events: none;
//         transition: opacity 0.3s ease;
//         opacity: 0;
//     }
//     .scroll-shadow.left {
//         left: 0;
//         background: linear-gradient(to right, rgba(0,0,0,0.1), transparent);
//     }
//     .scroll-shadow.right {
//         right: 0;
//         background: linear-gradient(to left, rgba(0,0,0,0.1), transparent);
//     }
// `;
// document.head.appendChild(tableStyles);

// // Enhanced file input styling
// document.querySelectorAll('input[type="file"]').forEach(fileInput => {
//     const wrapper = document.createElement('div');
//     wrapper.className = 'file-input-wrapper';
    
//     const label = document.createElement('label');
//     const fileName = document.createElement('span');
//     fileName.className = 'file-name';
//     fileName.textContent = 'No file chosen';
    
//     const button = document.createElement('span');
//     button.className = 'file-input-button';
//     button.textContent = 'Choose File';
    
//     label.appendChild(button);
//     label.appendChild(fileName);
//     wrapper.appendChild(label);
//     wrapper.appendChild(fileInput);
    
//     fileInput.parentNode.insertBefore(wrapper, fileInput);
//     wrapper.appendChild(fileInput);
    
//     fileInput.style.display = 'none';
    
//     fileInput.addEventListener('change', function() {
//         if (this.files.length > 0) {
//             fileName.textContent = this.files[0].name;
//         } else {
//             fileName.textContent = 'No file chosen';
//         }
//     });
// });

// // Add styles for file inputs
// const fileInputStyles = document.createElement('style');
// fileInputStyles.textContent = `
//     .file-input-wrapper {
//         margin-bottom: 1rem;
//     }
//     .file-input-wrapper label {
//         display: flex;
//         align-items: center;
//         gap: 10px;
//     }
//     .file-input-button {
//         padding: 0.6rem 1.2rem;
//         background-color: var(--primary-color);
//         color: white;
//         border-radius: var(--border-radius);
//         cursor: pointer;
//         transition: var(--transition);
//         font-size: 0.9rem;
//     }
//     .file-input-button:hover {
//         background-color: var(--secondary-color);
//     }
//     .file-name {
//         font-size: 0.9rem;
//         color: #6c757d;
//     }
// `;
// document.head.appendChild(fileInputStyles);

// // Tooltip functionality
// document.querySelectorAll('[data-tooltip]').forEach(element => {
//     const tooltip = document.createElement('div');
//     tooltip.className = 'tooltip';
//     tooltip.textContent = element.getAttribute('data-tooltip');
    
//     element.appendChild(tooltip);
    
//     element.addEventListener('mouseenter', function() {
//         tooltip.style.opacity = '1';
//         tooltip.style.visibility = 'visible';
//     });
    
//     element.addEventListener('mouseleave', function() {
//         tooltip.style.opacity = '0';
//         tooltip.style.visibility = 'hidden';
//     });
// });

// // Add styles for tooltips
// const tooltipStyles = document.createElement('style');
// tooltipStyles.textContent = `
//     .tooltip {
//         position: absolute;
//         bottom: 100%;
//         left: 50%;
//         transform: translateX(-50%);
//         background-color: var(--dark-color);
//         color: white;
//         padding: 0.5rem 1rem;
//         border-radius: 4px;
//         font-size: 0.8rem;
//         white-space: nowrap;
//         opacity: 0;
//         visibility: hidden;
//         transition: all 0.2s ease;
//         z-index: 100;
//         margin-bottom: 10px;
//     }
//     .tooltip::after {
//         content: '';
//         position: absolute;
//         top: 100%;
//         left: 50%;
//         transform: translateX(-50%);
//         border-width: 5px;
//         border-style: solid;
//         border-color: var(--dark-color) transparent transparent transparent;
//     }
// `;
// document.head.appendChild(tooltipStyles);

// // Password visibility toggle
// document.querySelectorAll('.password-toggle').forEach(toggle => {
//     const input = toggle.previousElementSibling;
//     const icon = toggle.querySelector('i');
    
//     toggle.addEventListener('click', function() {
//         if (input.type === 'password') {
//             input.type = 'text';
//             icon.classList.remove('fa-eye');
//             icon.classList.add('fa-eye-slash');
//         } else {
//             input.type = 'password';
//             icon.classList.remove('fa-eye-slash');
//             icon.classList.add('fa-eye');
//         }
//     });
// });

// // Add loading spinner to buttons during form submission
// document.querySelectorAll('form').forEach(form => {
//     form.addEventListener('submit', function() {
//         const submitButtons = this.querySelectorAll('button[type="submit"], input[type="submit"]');
        
//         submitButtons.forEach(button => {
//             button.disabled = true;
            
//             if (button.tagName === 'BUTTON') {
//                 const originalText = button.innerHTML;
//                 button.innerHTML = `
//                     <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
//                     ${originalText}
//                 `;
//             }
//         });
//     });
// });

// // Add styles for loading spinner
// const spinnerStyles = document.createElement('style');
// spinnerStyles.textContent = `
//     .spinner-border {
//         display: inline-block;
//         width: 1rem;
//         height: 1rem;
//         vertical-align: text-bottom;
//         border: 0.2em solid currentColor;
//         border-right-color: transparent;
//         border-radius: 50%;
//         animation: spinner-border 0.75s linear infinite;
//     }
//     @keyframes spinner-border {
//         to { transform: rotate(360deg); }
//     }
// `;
// document.head.appendChild(spinnerStyles);

// // Initialize any datepickers if needed
// if (typeof flatpickr !== 'undefined') {
//     document.querySelectorAll('.datepicker').forEach(input => {
//         flatpickr(input, {
//             dateFormat: 'Y-m-d',
//             allowInput: true
//         });
//     });
// }

// // Initialize any timepickers if needed
// if (typeof flatpickr !== 'undefined') {
//     document.querySelectorAll('.timepicker').forEach(input => {
//         flatpickr(input, {
//             enableTime: true,
//             noCalendar: true,
//             dateFormat: 'H:i',
//             time_24hr: true
//         });
//     });
// }

// // Handle modal functionality
// document.querySelectorAll('[data-toggle="modal"]').forEach(button => {
//     button.addEventListener('click', function() {
//         const target = this.getAttribute('data-target');
//         const modal = document.querySelector(target);
        
//         if (modal) {
//             modal.classList.remove('hidden');
//             document.body.style.overflow = 'hidden';
//         }
//     });
// });

// document.querySelectorAll('.modal .close, .modal .btn-close').forEach(button => {
//     button.addEventListener('click', function() {
//         const modal = this.closest('.modal');
//         modal.classList.add('hidden');
//         document.body.style.overflow = '';
//     });
// });

// // Close modal when clicking outside content
// document.querySelectorAll('.modal').forEach(modal => {
//     modal.addEventListener('click', function(e) {
//         if (e.target === this) {
//             this.classList.add('hidden');
//             document.body.style.overflow = '';
//         }
//     });
// });

// // Add styles for modals
// const modalStyles = document.createElement('style');
// modalStyles.textContent = `
//     .modal {
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background-color: rgba(0, 0, 0, 0.5);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         z-index: 1050;
//         opacity: 0;
//         visibility: hidden;
//         transition: all 0.3s ease;
//     }
//     .modal.show {
//         opacity: 1;
//         visibility: visible;
//     }
//     .modal-content {
//         background-color: white;
//         border-radius: var(--border-radius);
//         box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
//         width: 90%;
//         max-width: 800px;
//         max-height: 90vh;
//         overflow-y: auto;
//         transform: translateY(-50px);
//         transition: all 0.3s ease;
//     }
//     .modal.show .modal-content {
//         transform: translateY(0);
//     }
//     .modal-header {
//         padding: 1.5rem;
//         border-bottom: 1px solid #e9ecef;
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//     }
//     .modal-title {
//         margin: 0;
//         font-size: 1.5rem;
//     }
//     .modal-body {
//         padding: 1.5rem;
//     }
//     .modal-footer {
//         padding: 1.5rem;
//         border-top: 1px solid #e9ecef;
//         display: flex;
//         justify-content: flex-end;
//         gap: 0.5rem;
//     }
//     .close {
//         font-size: 1.5rem;
//         font-weight: 700;
//         line-height: 1;
//         color: #000;
//         opacity: 0.5;
//         background: none;
//         border: none;
//         cursor: pointer;
//         transition: opacity 0.2s ease;
//     }
//     .close:hover {
//         opacity: 1;
//     }
// `;
// document.head.appendChild(modalStyles);