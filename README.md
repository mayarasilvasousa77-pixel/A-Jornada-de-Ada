# A Jornada de Ada Lovelace
Jogo educativo 2D em HTML, CSS e JavaScript puro. Abra `index.html` no navegador (precisa de internet apenas para a fonte do Google Fonts; sem ela, usa fontes padrão).

- `index.html` – estrutura das telas (início, jogo, janelas, vitória)
- `css/style.css` – visual (roxo, dourado, bege, vinho)
- `js/script.js` – dados das 3 fases, movimento, perseguição do monstro, perguntas, pontuação e salvamento (localStorage)
- `imagens/` – imagens do site de referência e a skyline de Londres

Controles: setas ou WASD (joystick no celular). Pontuação: 100 por acerto de primeira, 50 após errar.


## Monstro da Matemática
- O monstro aparece nos cenários e persegue Ada enquanto ela explora.
- Ele começa com 10 vidas (uma por pergunta do jogo).
- Cada pergunta concluída corretamente remove uma vida do monstro.
- Respostas incorretas permitem tentar novamente e não removem vida.
- Ao perder todas as vidas, o monstro é derrotado e deixa de perseguir Ada.
- O monstro não causa dano à personagem; a perseguição é uma mecânica de pressão e diversão.
