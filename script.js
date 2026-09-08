document.addEventListener('DOMContentLoaded', function () {

  const form = document.getElementById('studentForm');
  const resultCard = document.getElementById('resultCard');
  const formAlert = document.getElementById('formAlert');
  const courseSelect = document.getElementById('courseSelect');
  const subjectsContainer = document.getElementById('subjectsContainer');
  const subjectHint = document.getElementById('subjectHint');

  /**
   * courseSubjectsMap
   * A lookup object where each course maps to its own list
   * of 5 subjects. This is the single source of truth used
   * to build the marks inputs and later the result table.
   */
  const courseSubjectsMap = {
    'JAVA': ['Java Fundamentals', 'java with DSA', 'Advance Java', 'Javascript', 'Full Stack'],
    'PYTHON': ['Python Fundamentals', 'Python with DSA', 'Python Libraries', 'ML Fundamentals', 'Data Analytics'],
    'EMBEDDED SYSTEMS': ['INTRODUCTION TO EMBEDDED SYSTEM', 'MICRO PROCESSER & MICRO CONTROLLER CLASSIFICATION', 'DESIGN', 'SENSORS AND ACTUATORS', 'COMMUNICATION PROTOCOLS'],
    'VLSI': ['VLSI INTRODUCTION', 'COMBINATIONS & CIRCUIT DESIGN', 'PROGRAMABLE LOGIC DEVICES', 'VHDL', 'VLSI TESTING'],
    'EEE':['SSS','POWER SYSTEM','ANALOG ELECTRONICS','CONTROL SYSTEMS','DIGITAL ELECTRONICS']
  };

  // Keeps track of the subjects currently loaded, so calculateResult()
  // and displayResult() know what labels to use.
  let currentSubjects = [];

  courseSelect.addEventListener('change', handleCourseChange);
  form.addEventListener('submit', handleFormSubmit);
  document.getElementById('resetBtn').addEventListener('click', handleReset);

  // Attach a click-ripple animation to every button on the page.
  document.querySelectorAll('.btn').forEach(btn => btn.addEventListener('click', spawnRipple));

  /**
   * spawnRipple(e)
   * Creates a small circular element sized to cover the button,
   * positioned at the click point, then lets the CSS keyframe
   * (.ripple / rippleAnim) scale + fade it out. The element
   * removes itself once the animation finishes.
   */
  function spawnRipple(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  /**
   * handleCourseChange()
   * Runs whenever the student picks a course from the dropdown.
   * Looks up that course's subject list in courseSubjectsMap and
   * rebuilds the marks input fields dynamically inside
   * #subjectsContainer, so each course shows its own subjects.
   */
  function handleCourseChange() {
    const selectedCourse = courseSelect.value;
    subjectsContainer.innerHTML = ''; // clear previous subject inputs
    currentSubjects = courseSubjectsMap[selectedCourse] || [];

    if (currentSubjects.length === 0) {
      subjectHint.classList.remove('d-none');
      return;
    }
    subjectHint.classList.add('d-none');

    currentSubjects.forEach((subject, index) => {
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-3';
      col.innerHTML = `
        <label class="form-label">${subject}</label>
        <input type="number" class="form-control marks-input"
               id="marks_${index}" min="0" max="100" required>
      `;
      subjectsContainer.appendChild(col);
    });
  }

  /**
   * handleFormSubmit()
   * Prevents the default page reload, validates the form,
   * and if everything checks out, calculates and displays
   * the result using the currently loaded subjects.
   */
  function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const marksArray = currentSubjects.map((_, index) =>
      Number(document.getElementById(`marks_${index}`).value)
    );

    const result = calculateResult(marksArray);
    displayResult(result);
  }

  /**
   * validateForm()
   * Validates every field: name, roll number, DOB, mobile
   * number, email, course selection, and each subject's marks.
   * Adds/removes Bootstrap's 'is-invalid' class to highlight
   * problem fields, and shows a summary alert if anything fails.
   */
  function validateForm() {
    let isValid = true;
    formAlert.classList.add('d-none');

    // Required text/select fields
    const requiredFields = ['studentName', 'rollNumber', 'dob', 'courseSelect'];
    requiredFields.forEach(id => {
      const field = document.getElementById(id);
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        isValid = false;
      } else {
        field.classList.remove('is-invalid');
      }
    });

    // Date of birth: must be a real date and not in the future
    const dobField = document.getElementById('dob');
    if (dobField.value) {
      const dobDate = new Date(dobField.value);
      const today = new Date();
      if (dobDate >= today) {
        dobField.classList.add('is-invalid');
        isValid = false;
      }
    }

    // Mobile number: exactly 10 digits, numeric only
    const mobileField = document.getElementById('mobileNumber');
    const mobilePattern = /^[6-9]\d{9}$/; // typical 10-digit mobile format
    if (!mobilePattern.test(mobileField.value.trim())) {
      mobileField.classList.add('is-invalid');
      isValid = false;
    } else {
      mobileField.classList.remove('is-invalid');
    }

    // Email format check
    const email = document.getElementById('studentEmail');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value)) {
      email.classList.add('is-invalid');
      isValid = false;
    } else {
      email.classList.remove('is-invalid');
    }

    // Must have subjects loaded (i.e. a course was chosen and rendered)
    if (currentSubjects.length === 0) {
      isValid = false;
    }

    // Marks range check (0–100) for each dynamically generated subject
    currentSubjects.forEach((_, index) => {
      const field = document.getElementById(`marks_${index}`);
      const value = Number(field.value);
      if (field.value === '' || value < 0 || value > 100 || isNaN(value)) {
        field.classList.add('is-invalid');
        isValid = false;
      } else {
        field.classList.remove('is-invalid');
      }
    });

    if (!isValid) {
      formAlert.textContent = 'Please correct the highlighted fields before submitting.';
      formAlert.classList.remove('d-none');
    }

    return isValid;
  }

  /**
   * calculateResult(marksArray)
   * Calculates total marks, percentage, and pass/fail status.
   * Max marks is derived from however many subjects the selected
   * course has (subjects.length * 100), so it adapts automatically
   * per course instead of being hardcoded to 500.
   */
  function calculateResult(marksArray) {
    const total = marksArray.reduce((sum, mark) => sum + mark, 0);
    const maxMarks = marksArray.length * 100;
    const percentage = (total / maxMarks) * 100;

    const failedAnySubject = marksArray.some(mark => mark < 40);
    const status = (failedAnySubject || percentage < 40) ? 'FAIL' : 'PASS';

    return {
      marks: marksArray,
      total: total,
      maxMarks: maxMarks,
      percentage: percentage.toFixed(2),
      status: status
    };
  }

  /**
   * displayResult(result)
   * Writes personal details (including DOB and mobile number)
   * and the subject-wise marks table into the result card.
   * The table is rebuilt using currentSubjects, so it always
   * matches the subjects of the course that was selected.
   */
  function displayResult(result) {
    document.getElementById('outName').textContent = document.getElementById('studentName').value;
    document.getElementById('outRoll').textContent = document.getElementById('rollNumber').value;
    document.getElementById('outDob').textContent = document.getElementById('dob').value;
    document.getElementById('outMobile').textContent = document.getElementById('mobileNumber').value;
    document.getElementById('outCourse').textContent = courseSelect.value;
    document.getElementById('outTotal').textContent = result.total;
    document.getElementById('outMax').textContent = result.maxMarks;
    document.getElementById('outPercentage').textContent = result.percentage;

    const tableBody = document.getElementById('marksTableBody');
    tableBody.innerHTML = '';
    currentSubjects.forEach((subject, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${subject}</td><td>${result.marks[index]}</td>`;
      tableBody.appendChild(row);
    });

    const statusAlert = document.getElementById('statusAlert');
    statusAlert.textContent = `Result: ${result.status}`;
    statusAlert.className = 'alert ' + (result.status === 'PASS' ? 'alert-success' : 'alert-danger');

    resultCard.classList.remove('d-none');
    resultCard.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * handleReset()
   * Clears validation styling, empties the dynamic subjects
   * container, resets the subject hint text, and hides the
   * result card so the form returns to its initial state.
   */
  function handleReset() {
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    formAlert.classList.add('d-none');
    resultCard.classList.add('d-none');
    subjectsContainer.innerHTML = '';
    subjectHint.classList.remove('d-none');
    currentSubjects = [];
  }

});