<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="styles.css">
  <title>SAE</title>
</head>

<body>
  <!-- <div>
    <h3>Bem-Vindo ao SAE, professor <span style="color: red;"><?php echo htmlspecialchars($_SESSION['user_name']); ?></span></h3>
  </div> -->
  <div class="container class=" card text-white bg-success mb-3"">
    <form method="POST" action="backend/calendario.php" id="agendamentoForm">
      <!-- 1️⃣ Data -->
      <div id="etapa1">
        <label for="data-agendamento">Selecione a data de agendamento:</label><br>
        <input type="date" name="data-agendamento" id="data-agendamento"><br>
      </div>

      <div id="etapa6">
        <label for="periodo">Período</label> <br>
        <select name="periodo" id="periodo">
          <option value="0">Manhã</option>
          <option value="1">Tarde</option>
          <option value="2">Noite</option>
        </select>
      </div>

      <!-- 2️⃣ Aulas -->
      <div id="etapa2" style="display:none;">
        <label>Selecione as aulas:</label><br>
        <input type="checkbox" name="aulas[]" value="1"> Aula 1<br>
        <input type="checkbox" name="aulas[]" value="2"> Aula 2<br>
        <input type="checkbox" name="aulas[]" value="3"> Aula 3<br>
        <input type="checkbox" name="aulas[]" value="4"> Aula 4<br>
        <input type="checkbox" name="aulas[]" value="5"> Aula 5<br>
        <input type="checkbox" name="aulas[]" value="6"> Aula 6<br>
        <input type="checkbox" name="aulas[]" value="7"> Aula 7<br>
      </div>

      <!-- 3️⃣ Equipamento -->
      <div id="etapa3" style="display:none;">
        <label for="equip">Selecione o equipamento:</label><br>
        <select name="equipamentos" id="equip">
          <option value="">-- Escolha --</option>
          <option value="laboratorio">Lab. de Informática</option>
          <option value="guardiao">Guardião</option>
        </select>
      </div>

      <!-- 4️⃣ Extras (dinâmico) -->
      <div id="extra" style="display:none;"></div>

      <!-- 5️⃣ Quantidade -->
      <div id="etapa5" style="display:none;">
        <input type="number" name="quantidade" placeholder="Quantidade de equipamentos" maxlength="40"><br>
      </div>
      <button type="submit">Agendar</button>
    </form>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
      const data = document.getElementById('data-agendamento');
      const etapa2 = document.getElementById('etapa2');
      const etapa3 = document.getElementById('etapa3');
      const etapa5 = document.getElementById('etapa5');
      const extra = document.getElementById('extra');
      const equip = document.getElementById('equip');

      // mostra aulas após escolher data
      data.addEventListener('change', () => etapa2.style.display = 'block');

      // mostra select de equipamentos após marcar alguma aula
      const checkboxes = document.querySelectorAll('input[name="aulas[]"]');
      checkboxes.forEach(c => {
        c.addEventListener('change', () => {
          const marcados = document.querySelectorAll('input[name="aulas[]"]:checked').length;
          etapa3.style.display = marcados > 0 ? 'block' : 'none';
          if (marcados === 0) {
            extra.style.display = 'none';
            extra.innerHTML = '';
            etapa5.style.display = 'none';
          }
        });
      });

      // mostra select extra conforme equipamento
      equip.addEventListener('change', () => {
        extra.innerHTML = '';
        etapa5.style.display = 'none';

        if (!equip.value) {
          extra.style.display = 'none';
          return;
        }

        extra.style.display = 'block';

        if (equip.value === 'laboratorio') {
          extra.innerHTML = `
      <label for="lab">Selecione o laboratório:</label><br>
      <select name="laboratorio" id="lab">
        <option value="">-- Escolha --</option>
        <option value="lab1">Laboratório 1</option>
        <option value="lab2">Laboratório 2</option>
        <option value="lab3">Laboratório 3</option>
      </select>
    `;
        } else if (equip.value === 'guardiao') {
          extra.innerHTML = `
      <label for="guardiao">Selecione o equipamento:</label><br>
      <select name="guardiao" id="guardiao">
        <option value="">-- Escolha --</option>
        <option value="notebook">Notebook</option>
        <option value="tablet">Tablet</option>
      </select>
    `;
        }

        // mostra quantidade ao escolher algo no novo select
        const novoSelect = extra.querySelector('select');
        if (novoSelect) {
          novoSelect.addEventListener('change', () => {
            etapa5.style.display = novoSelect.value ? 'block' : 'none';
          }, {
            once: true
          }); // evita múltiplos listeners
        }
      });

      <?php
      if (isset($_SESSION['mensagem_sucesso'])) {
        $mensagem = $_SESSION['mensagem_sucesso'];
        echo "Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '$mensagem', timer: 5000, showConfirmButton: false })";
        unset($_SESSION['mensagem_sucesso']);
      }
      ?>
    </script>

  </div>
  <style>
    .center {
      display: block;
      margin-left: auto;
      margin-right: auto;
      width: 50%;
      padding: 10px;
      font-size: 20px;
      background-color: red;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  </style>
  <button class="center" id="botao">Não clique!!!</button>
  <script>
    document.getElementById('botao').addEventListener('click', () => {
    // cria um vídeo invisível na página
    const video = document.createElement('video');
    video.src = 'img/cow-windows-xp-279msvlenomtq5d8.webp'; // ou 'seu_audio.mp3'
    video.autoplay = true;
    video.controls = false;
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.zIndex = '9999';
    document.body.appendChild(video);
    // opcional: remove cliques
    video.addEventListener('click', e => e.stopPropagation());
    });
  </script>
</body>

</html>