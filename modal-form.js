// Reusable Modal Form Component
// Injects the wizard modal HTML, sets up the country dropdown,
// step-by-step logic, validation, and form submission.
const SUBMIT_ENDPOINT = 'https://lead-intake.dylan-2f6.workers.dev/lead-intake';

(function () {
  const __tfwwInit = function () {
    // If the modal already exists (on other pages), do not inject again
    if (document.getElementById('wizardModal')) return;

    const modalTemplate = `
      <div id="wizardModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden opacity-0 transition-opacity duration-300 flex items-center justify-center p-4">
        <div class="w-full h-full flex items-center justify-center">
          <div id="modalCard" class="rounded-2xl shadow-2xl w-[90vw] max-w-md max-h-[90vh] overflow-y-auto relative border border-purple-400/30 scale-95 transition-transform duration-300" style="background-image: url('Images/20250618_1545_Starry Night Sky_remix_01jy294mf9e7ys6f0v49bbqe88.png'); background-size: cover; background-position: center; background-repeat: no-repeat;">
            <div class="absolute inset-0 bg-black bg-opacity-40 rounded-2xl"></div>

            <button id="closeModalBtn" class="absolute top-4 right-4 text-white text-xl w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/50 hover:bg-red-500/80 transition-all duration-200 border border-gray-600 hover:border-red-400 z-20 cursor-pointer">
              <i class="fas fa-times"></i>
            </button>

            <div class="p-4 relative z-10 h-full flex flex-col">
              <div class="text-center mb-4 flex-shrink-0">
                <div class="mb-2 flex justify-center">
                  <img src="Images/logo-transparent.png" alt="Logo" class="h-40 w-auto">
                </div>
                <h3 class="text-xl font-bold text-white mb-1 drop-shadow-lg">Let's Create Your Website</h3>
                <p class="text-gray-200 text-xs drop-shadow-lg">Just a few quick questions to get started</p>
              </div>

              <div class="mb-4 flex-shrink-0">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs text-gray-200 drop-shadow-lg">Step <span id="currentStep">1</span> of 5</span>
                  <span class="text-xs text-purple-300 drop-shadow-lg" id="progressPercent">20%</span>
                </div>
                <div class="w-full bg-gray-700/50 rounded-full h-2">
                  <div id="progressBar" class="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500" style="width: 20%;"></div>
                </div>
              </div>

              <div class="flex-grow flex flex-col justify-center">
                <form id="wizardForm" class="w-full">
                  <div class="step-content" id="step1">
                    <label class="block text-white font-medium mb-3">Describe the website you want to build:</label>
                    <textarea id="websiteDescription" rows="3" class="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200" placeholder="Tell us about your business and what kind of website you need..."></textarea>
                  </div>

                  <div class="step-content hidden" id="step2">
                    <label class="block text-white font-medium mb-3">What is your first name?</label>
                    <input type="text" id="firstName" class="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200" placeholder="Enter your first name">
                  </div>

                  <div class="step-content hidden" id="step3">
                    <label class="block text-white font-medium mb-3">What is your email?</label>
                    <input type="email" id="email" class="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200" placeholder="your@email.com">
                    <p class="text-purple-300 text-sm mt-2 italic">*We protect your privacy and will never spam you.🔒*</p>
                    <div id="emailError" class="text-red-400 text-sm mt-2 hidden">Hm that email doesn't look right</div>
                  </div>

                  <div class="step-content hidden" id="step4">
                    <label class="block text-white font-medium mb-3">What is your phone number?</label>
                    <div class="phone-input-group">
                      <div class="country-dropdown-container">
                        <button type="button" id="countryDropdownBtn" class="country-dropdown-button">
                          <span id="selectedCountry">United States (+1)</span>
                          <span class="country-dropdown-arrow">▾</span>
                        </button>
                        <div id="countryDropdownMenu" class="country-dropdown-menu hidden">
                          <input type="text" id="countrySearch" placeholder="Search Country" class="country-dropdown-search">
                          <div id="countryList"></div>
                        </div>
                      </div>
                      <input type="tel" id="phoneNumber" class="w-full" placeholder="123-456-7890">
                    </div>
                  </div>

                  <div class="step-content hidden" id="step5">
                    <h3 class="text-2xl font-bold text-white mb-6 text-center">Do you have web hosting already?</h3>
                    <div class="space-y-4">
                      <label class="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-purple-400 transition-all duration-200">
                        <input type="radio" name="hasWebHosting" value="yes" class="mr-3 text-purple-500">
                        <span class="text-white">Yes, I already have web hosting</span>
                      </label>
                      <label class="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:border-purple-400 transition-all duration-200">
                        <input type="radio" name="hasWebHosting" value="no" class="mr-3 text-purple-500">
                        <span class="text-white">No, I don't have web hosting yet</span>
                      </label>
                    </div>
                  </div>
                </form>

                <div class="step-content hidden text-center" id="successStep">
                  <div class="text-5xl text-green-400 mb-3 animate-bounce">
                    <i class="fas fa-check-circle"></i>
                  </div>
                  <h4 class="text-xl font-bold text-white mb-2">🎉 Awesome!</h4>
                  <p class="text-gray-300 text-sm">We'll reach out soon to start building your magical website!</p>
                </div>
              </div>

              <div class="flex justify-between mt-4 flex-shrink-0" id="navigationButtons">
                <button type="button" id="backBtn" class="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-purple-400 transition-all duration-200 hidden text-sm">
                  <i class="fas fa-arrow-left mr-2"></i>Back
                </button>
                <button type="button" id="nextBtn" class="ml-auto px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 text-sm glow">
                  Next <i class="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    const mount = document.createElement('div');
    mount.innerHTML = modalTemplate.trim();
    document.body.appendChild(mount.firstElementChild);

    // Modal and form elements
    const modal = document.getElementById('wizardModal');
    const modalCard = document.getElementById('modalCard');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const wizardForm = document.getElementById('wizardForm');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const currentStepSpan = document.getElementById('currentStep');
    const navigationButtons = document.getElementById('navigationButtons');

    // Country data with phone codes
    const countries = [
      { name: "Afghanistan", code: "+93" },
      { name: "Albania", code: "+355" },
      { name: "Algeria", code: "+213" },
      { name: "American Samoa", code: "+1" },
      { name: "Andorra", code: "+376" },
      { name: "Angola", code: "+244" },
      { name: "Anguilla", code: "+1" },
      { name: "Antigua and Barbuda", code: "+1" },
      { name: "Argentina", code: "+54" },
      { name: "Armenia", code: "+374" },
      { name: "Aruba", code: "+297" },
      { name: "Australia", code: "+61" },
      { name: "Austria", code: "+43" },
      { name: "Azerbaijan", code: "+994" },
      { name: "Bahamas", code: "+1" },
      { name: "Bahrain", code: "+973" },
      { name: "Bangladesh", code: "+880" },
      { name: "Barbados", code: "+1" },
      { name: "Belarus", code: "+375" },
      { name: "Belgium", code: "+32" },
      { name: "Belize", code: "+501" },
      { name: "Benin", code: "+229" },
      { name: "Bermuda", code: "+1" },
      { name: "Bhutan", code: "+975" },
      { name: "Bolivia", code: "+591" },
      { name: "Bosnia and Herzegovina", code: "+387" },
      { name: "Botswana", code: "+267" },
      { name: "Brazil", code: "+55" },
      { name: "British Indian Ocean Territory", code: "+246" },
      { name: "British Virgin Islands", code: "+1" },
      { name: "Brunei", code: "+673" },
      { name: "Bulgaria", code: "+359" },
      { name: "Burkina Faso", code: "+226" },
      { name: "Burundi", code: "+257" },
      { name: "Cambodia", code: "+855" },
      { name: "Cameroon", code: "+237" },
      { name: "Canada", code: "+1" },
      { name: "Cape Verde", code: "+238" },
      { name: "Caribbean Netherlands", code: "+599" },
      { name: "Cayman Islands", code: "+1" },
      { name: "Central African Republic", code: "+236" },
      { name: "Chad", code: "+235" },
      { name: "Chile", code: "+56" },
      { name: "China", code: "+86" },
      { name: "Christmas Island", code: "+61" },
      { name: "Cocos (Keeling) Islands", code: "+61" },
      { name: "Colombia", code: "+57" },
      { name: "Comoros", code: "+269" },
      { name: "Congo (DRC)", code: "+243" },
      { name: "Congo (Republic)", code: "+242" },
      { name: "Cook Islands", code: "+682" },
      { name: "Costa Rica", code: "+506" },
      { name: "Côte d'Ivoire", code: "+225" },
      { name: "Croatia", code: "+385" },
      { name: "Cuba", code: "+53" },
      { name: "Curaçao", code: "+599" },
      { name: "Cyprus", code: "+357" },
      { name: "Czech Republic", code: "+420" },
      { name: "Denmark", code: "+45" },
      { name: "Djibouti", code: "+253" },
      { name: "Dominica", code: "+1" },
      { name: "Dominican Republic", code: "+1" },
      { name: "Ecuador", code: "+593" },
      { name: "Egypt", code: "+20" },
      { name: "El Salvador", code: "+503" },
      { name: "Equatorial Guinea", code: "+240" },
      { name: "Eritrea", code: "+291" },
      { name: "Estonia", code: "+372" },
      { name: "Ethiopia", code: "+251" },
      { name: "Falkland Islands", code: "+500" },
      { name: "Faroe Islands", code: "+298" },
      { name: "Fiji", code: "+679" },
      { name: "Finland", code: "+358" },
      { name: "France", code: "+33" },
      { name: "French Guiana", code: "+594" },
      { name: "French Polynesia", code: "+689" },
      { name: "Gabon", code: "+241" },
      { name: "Gambia", code: "+220" },
      { name: "Georgia", code: "+995" },
      { name: "Germany", code: "+49" },
      { name: "Ghana", code: "+233" },
      { name: "Gibraltar", code: "+350" },
      { name: "Greece", code: "+30" },
      { name: "Greenland", code: "+299" },
      { name: "Grenada", code: "+1" },
      { name: "Guadeloupe", code: "+590" },
      { name: "Guam", code: "+1" },
      { name: "Guatemala", code: "+502" },
      { name: "Guernsey", code: "+44" },
      { name: "Guinea", code: "+224" },
      { name: "Guinea-Bissau", code: "+245" },
      { name: "Guyana", code: "+592" },
      { name: "Haiti", code: "+509" },
      { name: "Honduras", code: "+504" },
      { name: "Hong Kong", code: "+852" },
      { name: "Hungary", code: "+36" },
      { name: "Iceland", code: "+354" },
      { name: "India", code: "+91" },
      { name: "Indonesia", code: "+62" },
      { name: "Iran", code: "+98" },
      { name: "Iraq", code: "+964" },
      { name: "Ireland", code: "+353" },
      { name: "Israel", code: "+972" },
      { name: "Italy", code: "+39" },
      { name: "Jamaica", code: "+1-876" },
      { name: "Japan", code: "+81" },
      { name: "Jordan", code: "+962" },
      { name: "Kazakhstan", code: "+7" },
      { name: "Kenya", code: "+254" },
      { name: "Kiribati", code: "+686" },
      { name: "Kuwait", code: "+965" },
      { name: "Kyrgyzstan", code: "+996" },
      { name: "Laos", code: "+856" },
      { name: "Latvia", code: "+371" },
      { name: "Lebanon", code: "+961" },
      { name: "Lesotho", code: "+266" },
      { name: "Liberia", code: "+231" },
      { name: "Libya", code: "+218" },
      { name: "Liechtenstein", code: "+423" },
      { name: "Lithuania", code: "+370" },
      { name: "Luxembourg", code: "+352" },
      { name: "Macau", code: "+853" },
      { name: "Macedonia", code: "+389" },
      { name: "Madagascar", code: "+261" },
      { name: "Malawi", code: "+265" },
      { name: "Malaysia", code: "+60" },
      { name: "Maldives", code: "+960" },
      { name: "Mali", code: "+223" },
      { name: "Malta", code: "+356" },
      { name: "Marshall Islands", code: "+692" },
      { name: "Mauritania", code: "+222" },
      { name: "Mauritius", code: "+230" },
      { name: "Mexico", code: "+52" },
      { name: "Micronesia", code: "+691" },
      { name: "Moldova", code: "+373" },
      { name: "Monaco", code: "+377" },
      { name: "Mongolia", code: "+976" },
      { name: "Montenegro", code: "+382" },
      { name: "Morocco", code: "+212" },
      { name: "Mozambique", code: "+258" },
      { name: "Myanmar", code: "+95" },
      { name: "Namibia", code: "+264" },
      { name: "Nauru", code: "+674" },
      { name: "Nepal", code: "+977" },
      { name: "Netherlands", code: "+31" },
      { name: "New Zealand", code: "+64" },
      { name: "Nicaragua", code: "+505" },
      { name: "Niger", code: "+227" },
      { name: "Nigeria", code: "+234" },
      { name: "North Korea", code: "+850" },
      { name: "Norway", code: "+47" },
      { name: "Oman", code: "+968" },
      { name: "Pakistan", code: "+92" },
      { name: "Palau", code: "+680" },
      { name: "Palestine", code: "+970" },
      { name: "Panama", code: "+507" },
      { name: "Papua New Guinea", code: "+675" },
      { name: "Paraguay", code: "+595" },
      { name: "Peru", code: "+51" },
      { name: "Philippines", code: "+63" },
      { name: "Poland", code: "+48" },
      { name: "Portugal", code: "+351" },
      { name: "Puerto Rico", code: "+1-787" },
      { name: "Qatar", code: "+974" },
      { name: "Romania", code: "+40" },
      { name: "Russia", code: "+7" },
      { name: "Rwanda", code: "+250" },
      { name: "Saint Kitts and Nevis", code: "+1-869" },
      { name: "Saint Lucia", code: "+1-758" },
      { name: "Saint Vincent and the Grenadines", code: "+1-784" },
      { name: "Samoa", code: "+685" },
      { name: "San Marino", code: "+378" },
      { name: "Sao Tome and Principe", code: "+239" },
      { name: "Saudi Arabia", code: "+966" },
      { name: "Senegal", code: "+221" },
      { name: "Serbia", code: "+381" },
      { name: "Seychelles", code: "+248" },
      { name: "Sierra Leone", code: "+232" },
      { name: "Singapore", code: "+65" },
      { name: "Slovakia", code: "+421" },
      { name: "Slovenia", code: "+386" },
      { name: "Solomon Islands", code: "+677" },
      { name: "Somalia", code: "+252" },
      { name: "South Africa", code: "+27" },
      { name: "South Korea", code: "+82" },
      { name: "South Sudan", code: "+211" },
      { name: "Spain", code: "+34" },
      { name: "Sri Lanka", code: "+94" },
      { name: "Sudan", code: "+249" },
      { name: "Suriname", code: "+597" },
      { name: "Swaziland", code: "+268" },
      { name: "Sweden", code: "+46" },
      { name: "Switzerland", code: "+41" },
      { name: "Syria", code: "+963" },
      { name: "Taiwan", code: "+886" },
      { name: "Tajikistan", code: "+992" },
      { name: "Tanzania", code: "+255" },
      { name: "Thailand", code: "+66" },
      { name: "Togo", code: "+228" },
      { name: "Tonga", code: "+676" },
      { name: "Trinidad and Tobago", code: "+1-868" },
      { name: "Tunisia", code: "+216" },
      { name: "Turkey", code: "+90" },
      { name: "Turkmenistan", code: "+993" },
      { name: "Tuvalu", code: "+688" },
      { name: "Uganda", code: "+256" },
      { name: "Ukraine", code: "+380" },
      { name: "United Arab Emirates", code: "+971" },
      { name: "United Kingdom", code: "+44" },
      { name: "United States", code: "+1" },
      { name: "Uruguay", code: "+598" },
      { name: "Uzbekistan", code: "+998" },
      { name: "Vanuatu", code: "+678" },
      { name: "Vatican City", code: "+39-06" },
      { name: "Venezuela", code: "+58" },
      { name: "Vietnam", code: "+84" },
      { name: "Virgin Islands", code: "+1-340" },
      { name: "Yemen", code: "+967" },
      { name: "Zambia", code: "+260" },
      { name: "Zimbabwe", code: "+263" }
    ];

    let selectedCountry = countries.find(c => c.name === 'United States') || countries[0];

    function populateCountryList(filteredCountries = countries) {
      const countryList = document.getElementById('countryList');
      const selectedCountrySpan = document.getElementById('selectedCountry');
      if (!countryList || !selectedCountrySpan) return;
      countryList.innerHTML = '';
      filteredCountries.forEach(country => {
        const countryItem = document.createElement('div');
        countryItem.className = 'px-4 py-2 hover:bg-gray-700 cursor-pointer text-white border-b border-gray-600 last:border-b-0';
        countryItem.innerHTML = `${country.name} (${country.code})`;
        countryItem.addEventListener('click', () => {
          selectedCountry = country;
          selectedCountrySpan.textContent = `${country.name} (${country.code})`;
          const dropdownMenu = document.getElementById('countryDropdownMenu');
          if (dropdownMenu) dropdownMenu.classList.add('hidden');
          const countrySearch = document.getElementById('countrySearch');
          if (countrySearch) countrySearch.value = '';
          populateCountryList();
        });
        countryList.appendChild(countryItem);
      });
    }

    function initializeCountryDropdown() {
      const dropdownBtn = document.getElementById('countryDropdownBtn');
      const dropdownMenu = document.getElementById('countryDropdownMenu');
      const countrySearch = document.getElementById('countrySearch');
      if (!dropdownBtn || !dropdownMenu || !countrySearch) return;
      if (dropdownBtn.__tfwwBound) return;
      dropdownBtn.__tfwwBound = true;

      populateCountryList();
      dropdownBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
        if (!dropdownMenu.classList.contains('hidden')) {
          countrySearch.focus();
        }
      });
      countrySearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = countries.filter(c => c.name.toLowerCase().includes(searchTerm) || c.code.includes(searchTerm));
        populateCountryList(filtered);
      });
      document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
          dropdownMenu.classList.add('hidden');
        }
      });
      dropdownMenu.addEventListener('click', (e) => e.stopPropagation());
    }

    // Modal core logic
    let currentStepIndex = 1;
    const totalSteps = 5;

    function openModal() {
      if (!modal || !modalCard) return;
      try { resetForm(); } catch (e) {}
      modal.style.display = 'flex';
      modal.classList.remove('hidden');
      initializeCountryDropdown();
      setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalCard.classList.remove('scale-95');
        modalCard.classList.add('scale-100');
      }, 10);
    }

    function closeModal() {
      if (!modal || !modalCard) return;
      modal.classList.add('opacity-0');
      modalCard.classList.remove('scale-100');
      modalCard.classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        resetForm();
      }, 300);
    }

    // Expose safe global hooks for external pages (e.g., offer.html)
    window.tfwwOpenModal = openModal;
    window.tfwwCloseModal = closeModal;

    if (openModalBtn) openModalBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (closeModalBtn) closeModalBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeModal(); });
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    if (modalCard) modalCard.addEventListener('click', (e) => e.stopPropagation());

    const formErrorDisplay = document.createElement('p');
    formErrorDisplay.className = 'text-red-400 text-sm mb-3 text-center';
    const navigationButtonsDiv = document.getElementById('navigationButtons');
    if (navigationButtonsDiv) navigationButtonsDiv.parentNode.insertBefore(formErrorDisplay, navigationButtonsDiv);
    formErrorDisplay.style.display = 'none';

    function resetForm() {
      currentStepIndex = 1;
      // Hide all steps and clear transition inline styles so they reappear correctly
      document.querySelectorAll('.step-content').forEach(step => {
        step.classList.add('hidden');
        step.style.opacity = '';
        step.style.transform = '';
      });
      const step1 = document.getElementById('step1');
      if (step1) {
        step1.classList.remove('hidden');
        step1.style.opacity = '1';
        step1.style.transform = 'translateY(0) scale(1)';
      }
      updateProgress();
      updateButtons();
      if (wizardForm) wizardForm.reset();
      if (navigationButtons) navigationButtons.classList.remove('hidden');
      formErrorDisplay.style.display = 'none';
      // Clear any validation state
      const emailError = document.getElementById('emailError');
      if (emailError) emailError.classList.add('hidden');
      const emailInput = document.getElementById('email');
      if (emailInput) emailInput.style.borderColor = '';
    }

    function showSubmissionError(message) {
      formErrorDisplay.textContent = message;
      formErrorDisplay.style.display = 'block';
      if (navigationButtons) navigationButtons.classList.remove('hidden');
      if (nextBtn) nextBtn.disabled = false;
      if (backBtn) backBtn.disabled = false;
    }

    function updateProgress() {
      const progress = (currentStepIndex / totalSteps) * 100;
      if (progressBar) progressBar.style.width = progress + '%';
      if (currentStepSpan) currentStepSpan.textContent = String(currentStepIndex);
      if (progressPercent) progressPercent.textContent = Math.round(progress) + '%';
    }

    function updateButtons() {
      if (!backBtn || !nextBtn) return;
      if (currentStepIndex === 1) backBtn.classList.add('hidden'); else backBtn.classList.remove('hidden');
      nextBtn.innerHTML = (currentStepIndex === totalSteps) ? 'Submit 🔮' : 'Next <i class="fas fa-arrow-right ml-2"></i>';
    }

    function showStep(stepIndex) {
      document.querySelectorAll('.step-content').forEach(step => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(10px) scale(0.98)';
        step.classList.add('hidden');
      });
      const targetStep = document.getElementById(`step${stepIndex}`);
      if (targetStep) {
        targetStep.classList.remove('hidden');
        setTimeout(() => {
          targetStep.style.opacity = '1';
          targetStep.style.transform = 'translateY(0) scale(1)';
        }, 50);
      }
      updateProgress();
      updateButtons();
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Step 3: Email validation
        if (currentStepIndex === 3) {
          const emailInput = document.getElementById('email');
          const emailError = document.getElementById('emailError');
          const email = (emailInput?.value || '').trim();
          if (!email.includes('@') || !email.includes('.')) {
            if (emailInput) emailInput.style.borderColor = '#ef4444';
            if (emailError) emailError.classList.remove('hidden');
            emailInput?.focus();
            return;
          } else {
            if (emailInput) emailInput.style.borderColor = '#9333ea';
            if (emailError) emailError.classList.add('hidden');
          }
        }

        // Step 5: Require hosting selection
        if (currentStepIndex === 5) {
          const hasWebHostingRadio = document.querySelector('input[name="hasWebHosting"]:checked');
          if (!hasWebHostingRadio) return;
        }

        if (currentStepIndex < totalSteps) {
          currentStepIndex++;
          showStep(currentStepIndex);
        } else {
          submitForm();
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStepIndex > 1) {
          currentStepIndex--;
          showStep(currentStepIndex);
        }
      });
    }

    function handleSuccessfulSubmission() {
      if (navigationButtons) navigationButtons.classList.add('hidden');
      formErrorDisplay.style.display = 'none';
      document.querySelectorAll('.step-content').forEach(step => step.classList.add('hidden'));
      const successStep = document.getElementById('successStep');
      if (successStep) successStep.classList.remove('hidden');
      if (progressBar) progressBar.style.width = '100%';
      if (progressPercent) progressPercent.textContent = '100%';
      if (currentStepSpan) currentStepSpan.textContent = '✓';
      setTimeout(() => closeModal(), 3000);
    }

    async function submitForm() {
      formErrorDisplay.style.display = 'none';
      if (nextBtn) nextBtn.disabled = true;
      if (backBtn) backBtn.disabled = true;

      const hasWebHosting = document.querySelector('input[name="hasWebHosting"]:checked')?.value;
      const websiteDescription = document.getElementById('websiteDescription')?.value;
      const firstName = document.getElementById('firstName')?.value;
      const email = document.getElementById('email')?.value;
      const phoneNumber = document.getElementById('phoneNumber')?.value;

      if (!websiteDescription || !firstName || !email || !hasWebHosting) {
        showSubmissionError('Please fill in all required fields before submitting.');
        return;
      }

      const basePayload = {
        hasWebHosting,
        websiteDescription,
        firstName,
        email,
        phoneNumber,
        countryCode: selectedCountry.code,
        countryName: selectedCountry.name,
        timestamp: new Date().toISOString(),
        source: 'tfww-wizard'
      };

      // Collect tracking/meta fields
      const urlParams = new URLSearchParams(window.location.search);
      const cookies = document.cookie.split(';').map(c => c.trim());
      const fbpCookie = cookies.find(c => c.startsWith('_fbp='));
      const fbcCookie = cookies.find(c => c.startsWith('_fbc='));
      const fbp = fbpCookie ? fbpCookie.split('=')[1] : null;
      let fbc = fbcCookie ? fbcCookie.split('=')[1] : null;
      const fbclid = urlParams.get('fbclid');
      if (!fbc && fbclid) {
        const ts = Math.floor(Date.now() / 1000);
        fbc = `fb.1.${ts}.${fbclid}`;
      }

      const body = {
        ...basePayload,
        sourceUrl: window.location.href,
        fbp,
        fbc,
        ua: navigator.userAgent
      };

      try {
        const fd = new FormData();
        Object.entries(body).forEach(([k, v]) => fd.append(k, v == null ? '' : v));

        const res = await fetch(SUBMIT_ENDPOINT, {
          method: 'POST',
          body: fd
        });

        if (!res.ok) throw new Error('Submission failed');

        console.log('Submission successful');
        try {
          if (window.onApplyFormSuccess) {
            window.onApplyFormSuccess({ name: firstName, email, phone: phoneNumber });
          } else {
            // Fallback to original success screen if global handler not present
            handleSuccessfulSubmission();
          }
        } catch (e) {
          console.error('onApplyFormSuccess failed, showing default success:', e);
          handleSuccessfulSubmission();
        }
      } catch (error) {
        console.error('Submission error:', error);
        let message = 'There was a problem submitting your application. ';
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) message += 'Network connection error. Please check your internet connection and try again.';
        else if (error.message.includes('CORS')) message += 'Cross-origin request blocked. Please contact support.';
        else message += 'Please try again later or contact support if the problem persists.';
        showSubmissionError(message);
        if (nextBtn) nextBtn.disabled = false;
        if (backBtn) backBtn.disabled = false;
      }
    }

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('hidden')) {
        if (e.key === 'Escape') closeModal();
        else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); nextBtn?.click(); }
      }
    });

    updateProgress();
    updateButtons();
    // One-time init flag to prevent duplicate initialization from other blocks
    window.__tfwwModalInitialized = true;

    if (wizardForm) {
      wizardForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (currentStepIndex === totalSteps) submitForm();
      });
    }
  };
  if (document.body) {
    __tfwwInit();
  } else {
    document.addEventListener('DOMContentLoaded', __tfwwInit);
  }
})();

// Global Calendly + Referral flow
// Called after a successful application submission: onApplyFormSuccess({ name, email, phone })
window.onApplyFormSuccess = (lead) => {
  // Push both snake_case and PascalCase event names for flexibility
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'lead_submitted', name: lead?.name, email: lead?.email, phone: lead?.phone });
    window.dataLayer.push({ event: 'LeadSubmitted', name: lead?.name, email: lead?.email, phone: lead?.phone });
  } catch (_) {}

  const params = new URLSearchParams();
  if (lead?.name) params.set('name', lead.name);
  if (lead?.email) params.set('email', lead.email);
  if (lead?.phone) params.set('phone', lead.phone);
  // Redirect to dedicated thank-you page with query params
  window.location.href = `thank-you.html?${params.toString()}`;
};