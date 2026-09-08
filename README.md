# Student Registration & Result Portal

A single-page web app for registering a student, entering their marks, and instantly generating a result summary (total, percentage, pass/fail) — all client-side, no backend required.
demo link : https://kaveri-049.github.io/Student_registration_and_Result_Portal/

## Features

- **Registration form** — name, roll number, date of birth, mobile number, email, and course selection, with full inline validation.
- **Dynamic subjects** — picking a course (Java, Python, Embedded Systems, VLSI, EEE) automatically loads that course's 5 subjects as marks-entry fields.
- **Automatic result calculation** — total marks, percentage, and pass/fail status (fails if any subject is below 40 or overall percentage is below 40%).
- **Result summary card** — student details and a subject-wise marks table, revealed with a smooth animation after submission.
- **Styled UI** — custom indigo/violet/amber theme on top of Bootstrap, with animated buttons (hover lift + click ripple) and form feedback states.

## Files

| File         | Purpose                                                   |
|--------------|------------------------------------------------------------|
| `index.html` | Page structure — the registration form and result card.    |
| `script.js`  | Form validation, dynamic subject loading, result calculation, and button ripple animation. |
| `style.css`  | Color theme, layout polish, and animations.                |

## Running it

No build step or server needed:

1. Keep all three files in the same folder.
2. Open `index.html` in any modern browser.

(Requires an internet connection on first load, since Bootstrap and the Google Fonts used for headings/body text are loaded from a CDN.)

## How it works

1. Fill in the student's details and pick a **Course** — the marks fields for that course's subjects appear automatically.
2. Enter marks (0–100) for each subject.
3. Click **Submit & Calculate Result** — the form is validated, and if everything checks out, the Result card appears with:
   - Student details
   - A marks table for each subject
   - Total marks out of the course's max (subjects × 100)
   - Percentage
   - Pass/Fail status
4. Click **Reset** to clear the form and start over.

## Customizing

- **Add or edit a course**: update the `courseSubjectsMap` object near the top of `script.js` — add a course key with its list of subject names, and a matching `<option>` in the course `<select>` in `index.html`.
- **Change the pass mark**: edit the `40` thresholds inside `calculateResult()` in `script.js`.
- **Change colors**: all theme colors are CSS variables at the top of `style.css` (`:root { --ink-900, --violet-500, --amber-400, ... }`) — change them there to re-theme the whole page.

## Notes

- Mobile number is validated against a 10-digit pattern starting with 6–9 (typical Indian mobile number format) — adjust the regex in `validateForm()` in `script.js` if you need a different format.
- All validation and calculation happens in the browser; no data is sent anywhere or stored between page loads.
