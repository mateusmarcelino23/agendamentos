<?php
require_once 'config.php';
require_once 'database.php';

// Verificar se está logado
if (!isset($_SESSION['user_id'])) {
  header('Location: index.php');
  exit;
}

$user = getUserById($_SESSION['user_id']);
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seletor de Aulas</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #f5deb3 0%, #d2b48c 100%);
      color: #333;
    }

    .calendar-container {
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
    }

    .calendar-header {
      text-align: center;
    }

    .calendar-header h1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      font-size: clamp(1rem, 2vw, 1.25rem);
      color: #666;
      font-style: italic;
    }

    .calendar-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    /* Calendar Section */
    .calendar-section {
      padding: 2rem;
      border-right: 1px solid #e5e7eb;
    }

    .calendar-header-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .current-month {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0d6efd;
      text-transform: uppercase;
    }

    .btn-nav {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-nav:hover {
      background: #f3f4f6;
      color: #0d6efd;
    }

    .calendar-grid {
      display: block;
      /* wrapper for weekday header row + days grid */
    }

    .weekday-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .weekday-header {
      text-align: center;
      font-weight: 600;
      font-size: 0.875rem;
      color: #666;
      padding: 0.75rem 0;
    }

    #calendarDays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
    }

    .calendar-day {
      width: 100%;
      padding-top: 100%;
      /* create square using padding hack for cross-browser */
      position: relative;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      font-size: 0.95rem;
      overflow: hidden;
    }

    .calendar-day>span {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .calendar-day:not(.other-month):hover {
      background: #e7f3ff;
      color: #0d6efd;
    }

    .calendar-day.other-month {
      color: #d1d5db;
      cursor: default;
    }

    .calendar-day.today {
      background: #e7f3ff;
      color: #0d6efd;
      font-weight: 700;
    }

    .calendar-day.selected {
      background: #0d6efd;
      color: white;
      font-weight: 700;
    }

    /* Classes Section */
    .classes-section {
      padding: 2rem;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
    }

    .selected-date-display {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0d6efd;
      text-align: center;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .classes-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-grow: 1;
    }

    .class-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }

    .class-item:hover {
      border-color: #0d6efd;
      background: #f8fbff;
    }

    .class-item.selected {
      border-color: #0d6efd;
      background: #e7f3ff;
    }

    .class-item.interval-item {
      background: #fff9e6;
      border-color: #ffc107;
    }

    .class-item.interval-item:hover {
      border-color: #ffb300;
      background: #fff5cc;
    }

    .class-item.interval-item.selected {
      border-color: #ffc107;
      background: #ffe699;
    }

    .class-checkbox {
      width: 24px;
      height: 24px;
      border: 2px solid #d1d5db;
      border-radius: 6px;
      position: relative;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .class-item.selected .class-checkbox {
      background: #0d6efd;
      border-color: #0d6efd;
    }

    .class-item.interval-item.selected .class-checkbox {
      background: #ffc107;
      border-color: #ffc107;
    }

    .class-item.selected .class-checkbox::after {
      content: '';
      position: absolute;
      left: 7px;
      top: 3px;
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .class-label {
      font-size: 1rem;
      font-weight: 600;
      color: #333;
    }

    .btn-confirm {
      width: 100%;
      padding: 1rem;
      background: #0d6efd;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.125rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-confirm:hover:not(:disabled) {
      background: #0b5ed7;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
    }

    .btn-confirm:disabled {
      background: #d1d5db;
      cursor: not-allowed;
    }

    .selection-summary {
      margin-top: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      font-size: 0.875rem;
      color: #666;
      display: none;
    }

    .selection-summary.show {
      display: block;
    }

    /* Responsive Design */
    @media (max-width: 991px) {
      .calendar-section {
        border-right: none;
        border-bottom: 1px solid #e5e7eb;
      }
    }

    @media (max-width: 576px) {

      .calendar-section,
      .classes-section {
        padding: 1.5rem;
      }

      .calendar-header h1 {
        font-size: 2rem;
      }

      .current-month {
        font-size: 1.25rem;
      }

      .calendar-day {
        font-size: 0.875rem;
      }

      .weekday-header {
        font-size: 0.75rem;
        padding: 0.5rem 0;
      }

      .class-item {
        padding: 0.875rem 1rem;
      }

      .class-label {
        font-size: 0.9375rem;
      }

      .selected-date-display {
        font-size: 1.125rem;
      }
    }
  </style>
</head>

<body class="bg-light d-flex justify-content-center align-items-center vh-100">
  <div class="container">
    <div class="dashboard">
      <div class="profile-header">
        <?php if ($user['foto']): ?>
          <img src="<?php echo htmlspecialchars($user['foto']); ?>" alt="Foto de perfil" class="profile-pic">
        <?php endif; ?>
        <h1>Olá, <?php echo htmlspecialchars($user['nome']); ?>!</h1>
        <p class="email"><?php echo htmlspecialchars($user['email']); ?></p>
      </div>

      <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3">
        <div class="calendar-container">
          <div class="calendar-header text-center mb-4">
            <h1 class="display-4 fw-bold">
              <span class="text-warning">CALENDÁRIO</span>
              <span class="text-primary">PICKER</span>
            </h1>
            <p class="subtitle">Selecione a data e as aulas</p>
          </div>

          <div class="calendar-card">
            <div class="row g-0">
              <!-- Calendar Section -->
              <div class="col-lg-7 calendar-section">
                <div class="calendar-header-controls">
                  <button class="btn-nav" id="prevMonth" aria-label="Mês anterior">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
                    </svg>
                  </button>
                  <h2 class="current-month" id="currentMonth"></h2>
                  <button class="btn-nav" id="nextMonth" aria-label="Próximo mês">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                    </svg>
                  </button>
                </div>

                <div class="calendar-grid">
                  <div class="weekday-row">
                    <div class="weekday-header">DOM</div>
                    <div class="weekday-header">SEG</div>
                    <div class="weekday-header">TER</div>
                    <div class="weekday-header">QUA</div>
                    <div class="weekday-header">QUI</div>
                    <div class="weekday-header">SEX</div>
                    <div class="weekday-header">SÁB</div>
                  </div>

                  <div id="calendarDays"></div>
                </div>
              </div>

              <!-- Classes Selection Section -->
              <div class="col-lg-5 classes-section">
                <div class="selected-date-display" id="selectedDateDisplay">
                  Selecione uma data
                </div>

                <div class="classes-list" id="classesList">
                  <div class="class-item" data-class="aula1">
                    <div class="class-checkbox"></div>
                    <span class="class-label">Aula 1</span>
                  </div>
                  <div class="class-item" data-class="aula2">
                    <div class="class-checkbox"></div>
                    <span class="class-label">Aula 2</span>
                  </div>
                  <div class="class-item" data-class="aula3">
                    <div class="class-checkbox"></div>
                    <span class="class-label">Aula 3</span>
                  </div>
                  <div class="class-item interval-item" data-class="intervalo">
                    <div class="class-checkbox"></div>
                    <span class="class-label">Intervalo</span>
                  </div>
                  <div class="class-item" data-class="aula4">
                    <div class="class-checkbox"></div>
                    <span class="class-label">Aula 4</span>
                  </div>
                  <div class="class-item" data-class="aula5">
                    <div class="class-checkbox"></div>
                    <span class="class-label">Aula 5</span>
                  </div>
                  <div class="class-item" data-class="aula6">
                    <div class="class-checkbox"></div>
                    <span class="class-label">Aula 6</span>
                  </div>
                </div>

                <button class="btn-confirm" id="confirmBtn" disabled>
                  Confirmar Seleção
                </button>

                <div class="selection-summary" id="selectionSummary"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- <div class="user-info">
                <h2>Informações da Conta</h2>
                <div class="info-item">
                    <strong>ID:</strong> <?php echo htmlspecialchars($user['id']); ?>
                </div>
                <div class="info-item">
                    <strong>Cadastrado em:</strong> <?php echo date('d/m/Y H:i', strtotime($user['criado_em'])); ?>
                </div>
                <div class="info-item">
                    <strong>Último login:</strong> <?php echo date('d/m/Y H:i', strtotime($user['ultimo_login'])); ?>
                </div>
            </div> -->

      <a href="logout.php" class="logout-btn">Sair</a>

    </div>
  </div>
  <!-- <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.9.0/js/bootstrap-datepicker.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.9.0/locales/bootstrap-datepicker.pt-BR.min.js"></script> -->

  <script>
    // Calendar State
    let currentDate = new Date();
    let selectedDate = null;
    let selectedClasses = new Set();

    // DOM Elements
    const currentMonthEl = document.getElementById('currentMonth');
    const calendarDaysEl = document.getElementById('calendarDays');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const classItems = document.querySelectorAll('.class-item');
    const confirmBtn = document.getElementById('confirmBtn');
    const selectionSummary = document.getElementById('selectionSummary');

    // Month names in Portuguese
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    // Initialize Calendar
    function initCalendar() {
      renderCalendar();
      setupEventListeners();
    }

    // Render Calendar
    function renderCalendar() {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Update month display
      currentMonthEl.textContent = `${monthNames[month]} ${year}`;

      // Get first day of month and number of days
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      // Clear calendar
      calendarDaysEl.innerHTML = '';

      // Previous month days
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = createDayElement(day, true);
        calendarDaysEl.appendChild(dayEl);
      }

      // Current month days
      const today = new Date();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = createDayElement(day, false);
        const currentDateObj = new Date(year, month, day);

        // Mark today
        if (
          currentDateObj.getDate() === today.getDate() &&
          currentDateObj.getMonth() === today.getMonth() &&
          currentDateObj.getFullYear() === today.getFullYear()
        ) {
          dayEl.classList.add('today');
        }

        // Mark selected
        if (selectedDate &&
          currentDateObj.getDate() === selectedDate.getDate() &&
          currentDateObj.getMonth() === selectedDate.getMonth() &&
          currentDateObj.getFullYear() === selectedDate.getFullYear()
        ) {
          dayEl.classList.add('selected');
        }

        calendarDaysEl.appendChild(dayEl);
      }

      // Next month days
      const totalCells = calendarDaysEl.children.length;
      const remainingCells = 42 - totalCells; // 6 rows * 7 days
      for (let day = 1; day <= remainingCells; day++) {
        const dayEl = createDayElement(day, true);
        calendarDaysEl.appendChild(dayEl);
      }
    }

    // Create day element
    function createDayElement(day, isOtherMonth) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';

      const inner = document.createElement('span');
      inner.textContent = day;
      dayEl.appendChild(inner);

      if (isOtherMonth) {
        dayEl.classList.add('other-month');
      } else {
        dayEl.addEventListener('click', () => selectDate(day));
      }

      return dayEl;
    }

    // Select date
    function selectDate(day) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      selectedDate = new Date(year, month, day);

      // Update display
      const dayName = weekDays[selectedDate.getDay()];
      const formattedDate = `${dayName}, ${day} de ${monthNames[month]}`;
      selectedDateDisplay.textContent = formattedDate;

      // Re-render calendar to show selection
      renderCalendar();

      // Enable confirm button if classes are selected
      updateConfirmButton();
    }

    // Setup event listeners
    function setupEventListeners() {
      // Month navigation
      prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
      });

      nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
      });

      // Class selection
      classItems.forEach(item => {
        item.addEventListener('click', () => {
          const className = item.dataset.class;

          if (selectedClasses.has(className)) {
            selectedClasses.delete(className);
            item.classList.remove('selected');
          } else {
            selectedClasses.add(className);
            item.classList.add('selected');
          }

          updateConfirmButton();
        });
      });

      // Confirm button
      confirmBtn.addEventListener('click', handleConfirm);
    }

    // Update confirm button state
    function updateConfirmButton() {
      if (selectedDate && selectedClasses.size > 0) {
        confirmBtn.disabled = false;
      } else {
        confirmBtn.disabled = true;
      }
    }

    // Handle confirm
    function handleConfirm() {
      if (!selectedDate || selectedClasses.size === 0) {
        return;
      }

      // Prepare data for backend
      const data = {
        date: selectedDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        classes: Array.from(selectedClasses)
      };

      // Show summary
      const classesText = Array.from(selectedClasses)
        .map(c => c.charAt(0).toUpperCase() + c.slice(1).replace(/(\d)/, ' $1'))
        .join(', ');

      selectionSummary.innerHTML = `
        <strong>Seleção confirmada!</strong><br>
        Data: ${selectedDate.toLocaleDateString('pt-BR')}<br>
        Aulas: ${classesText}
    `;
      selectionSummary.classList.add('show');

      // Send to backend
      sendToBackend(data);

      // Hide summary after 3 seconds
      setTimeout(() => {
        selectionSummary.classList.remove('show');
      }, 3000);
    }

    // Send data to backend
    async function sendToBackend(data) {
      console.log('[v0] Dados preparados para envio:', data);

      try {
        // Uncomment and configure when backend is ready
        /*
        const response = await fetch('/api/schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao enviar dados');
        }
        
        const result = await response.json();
        console.log('[v0] Resposta do servidor:', result);
        
        // Reset selections
        selectedClasses.clear();
        classItems.forEach(item => item.classList.remove('selected'));
        updateConfirmButton();
        */

        // For now, just log the data
        alert('Dados prontos para envio ao backend:\n\n' + JSON.stringify(data, null, 2));

      } catch (error) {
        console.error('[v0] Erro ao enviar dados:', error);
        alert('Erro ao processar a solicitação. Tente novamente.');
      }
    }

    // Initialize on load
    document.addEventListener('DOMContentLoaded', initCalendar);
  </script>
</body>

</html>