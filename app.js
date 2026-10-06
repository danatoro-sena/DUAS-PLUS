const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];
const profiles=[];
function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function getPublicShareUrl(){
  // Si se define una URL pública fija, tiene prioridad.
  // Ejemplo: window.DUAS_PUBLIC_URL = 'https://tu-sitio.netlify.app/';
  const configured = (window.DUAS_PUBLIC_URL || '').trim();
  if(configured){
    try{
      const u = new URL(configured, window.location.href);
      return /^https?:$/.test(u.protocol) ? u.href.split('#')[0] : null;
    }catch(e){}
  }

  // Al publicar en Netlify/GitHub Pages/Vercel, el mismo código detecta
  // automáticamente la URL pública real. Nunca genera un QR LAN.
  try{
    const u = new URL(window.location.href);
    if(!/^https?:$/.test(u.protocol)) return null;
    if(/^(localhost|127\.0\.0\.1)$/i.test(u.hostname)) return null;
    return `${u.origin}${u.pathname}`.replace(/index\.html$/i,'');
  }catch(e){
    return null;
  }
}

function initQR(url){
  ['#qrImage','#qrImageFinal'].forEach(sel=>{
    const img=$(sel);
    if(!img)return;
    const wrap=img.parentElement;
    wrap.innerHTML='';
    const holder=document.createElement('div');
    holder.className='qr-holder';
    wrap.appendChild(holder);
    if(url && window.QRCode){
      new QRCode(holder,{text:url,width:150,height:150,colorDark:'#07130d',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
    }else{
      holder.innerHTML='<div class="qr-fallback">Publica DUAS+ para generar el QR público.</div>';
    }
  });

  const card=$('#qrCard');
  const status=$('#qrStatus');
  const help=$('#qrHelp');
  const copy=$('#copyUrl');
  const share=$('#shareBtn');

  if(status){
    status.textContent=url ? 'QR público listo para compartir.' : 'QR pendiente: publica esta carpeta en Internet.';
  }
  if(help){
    help.textContent=url
      ? 'Escanéalo desde cualquier celular con Internet, sin compartir la misma Wi‑Fi.'
      : 'Publica DUAS+ en Netlify, Vercel o GitHub Pages. Al abrirla allí, el QR se generará con esa URL pública.';
  }
  if(card) card.dataset.qrUrl=url||'';
  if(copy){
    copy.disabled=!url;
    copy.title=url?'Copiar URL pública':'Disponible después de publicar DUAS+';
  }
  if(share){
    share.disabled=!url;
    share.title=url?'Compartir DUAS+':'Disponible después de publicar DUAS+';
  }
  return url;
}

function setupQR(){
  const url=getPublicShareUrl();
  initQR(url);

  const copy=$('#copyUrl');
  if(copy && url) copy.onclick=async()=>{
    try{await navigator.clipboard.writeText(url);toast('Enlace público copiado');}
    catch{toast(url)}
  };

  const share=$('#shareBtn');
  if(share && url) share.onclick=async()=>{
    try{
      if(navigator.share) await navigator.share({title:'DUAS+',text:'El aprendizaje se adapta a ti.',url});
      else {await navigator.clipboard.writeText(url);toast('Enlace público copiado');}
    }catch{}
  };
}
function initReveal(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});$$('.reveal').forEach(el=>io.observe(el))}
function initProgress(){addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;const pct=h?scrollY/h*100:0;$('#progressBar').style.width=pct+'%'},{passive:true})}
function initTheme() {
  const button = $('#themeBtn');
  if (!button) return;

  const savedTheme = localStorage.getItem('duas-theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-ui');
  }

  updateThemeIcon();

  button.addEventListener('click', () => {
    document.body.classList.toggle('dark-ui');

    const isDark = document.body.classList.contains('dark-ui');

    localStorage.setItem(
      'duas-theme',
      isDark ? 'dark' : 'light'
    );

    updateThemeIcon();

    toast(
      isDark
        ? 'Modo oscuro activado'
        : 'Modo claro activado'
    );
  });
}

function updateThemeIcon() {
  const button = $('#themeBtn');

  if (!button) return;

  button.innerHTML = `
    <i data-lucide="sun-moon"></i>
  `;

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
}
function initMenu(){const b=$('#menuBtn');if(b)b.onclick=()=>$('#mobileMenu')?.classList.toggle('open');$$('.mobile-menu a').forEach(a=>a.onclick=()=>$('#mobileMenu')?.classList.remove('open'))}
function initIcons(){if(window.lucide?.createIcons)window.lucide.createIcons()}
function initCounters(){const obs=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;const end=Number(el.dataset.count||0);let start=0;const t0=performance.now();const dur=1200;const tick=(now)=>{const p=Math.min((now-t0)/dur,1);const v=Math.floor(end*(1-Math.pow(1-p,3)));el.textContent=v.toLocaleString('es-CO');if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick);obs.unobserve(el)}),{threshold:.5});$$('[data-count]').forEach(x=>obs.observe(x))}
function initAssetFallbacks(){$$('.sena-logo-wrap img,.final-laia-image img').forEach(img=>{img.addEventListener('error',()=>{img.style.display='none';img.parentElement.classList.add('asset-missing')})})}
/* =========================================================
   CHATBOT LAIA — PREGUNTAS CERRADAS POR CATEGORÍAS
========================================================= */

const laiaChatData = {

  duas: {
    title: "Sobre DUAS+",

    questions: [
      {
        question: "¿DUAS+ reemplaza a los instructores?",
        answer: "No. DUAS+ funciona como una herramienta de apoyo. El instructor continúa siendo quien orienta y acompaña el proceso formativo."
      },

      {
        question: "¿DUAS+ está pensado únicamente para personas con discapacidad?",
        answer: "No. Busca mejorar la accesibilidad para cualquier aprendiz que pueda necesitar una experiencia de aprendizaje diferente."
      },

      {
        question: "¿DUAS+ necesita que el aprendiz declare una discapacidad?",
        answer: "No necesariamente. La plataforma busca ofrecer opciones de adaptación sin obligar al usuario a identificarse públicamente."
      },

      {
        question: "¿DUAS+ funciona solamente para aprendices SENA?",
        answer: "El proyecto está pensado principalmente para el contexto SENA, aunque su enfoque de accesibilidad puede aplicarse a otros entornos educativos."
      },

      {
        question: "¿Qué problema busca solucionar?",
        answer: "Las barreras de acceso al aprendizaje. La idea es que diferentes necesidades puedan encontrar diferentes formas de interactuar con la misma plataforma."
      }
    ]
  },


  laia: {
    title: "Sobre LAIA",

    questions: [
      {
        question: "¿LAIA es una persona real?",
        answer: "No. LAIA es un avatar y asistente inteligente diseñado como parte de la experiencia de DUAS+."
      },

      {
        question: "¿LAIA puede hablar con el aprendiz?",
        answer: "Sí. Una de sus funciones planteadas es permitir interacción mediante voz y acompañamiento conversacional."
      },

      {
        question: "¿LAIA puede interpretar lengua de señas?",
        answer: "Sí, dentro de la propuesta. LAIA contempla representación mediante señas como uno de sus canales de interacción."
      }
    ]
  },


  tecnologia: {
    title: "Tecnología",

    questions: [
      {
        question: "¿DUAS+ funciona en celular?",
        answer: "Sí. La plataforma está planteada como una experiencia web responsive, por lo que puede consultarse desde dispositivos móviles."
      },

      {
        question: "¿Necesito instalar una aplicación?",
        answer: "No. La propuesta está planteada como una plataforma web."
      },

      {
        question: "¿Necesito un computador potente?",
        answer: "No necesariamente. Al ser una experiencia web, el objetivo es que pueda utilizarse desde dispositivos con acceso a un navegador compatible."
      },

      {
        question: "¿DUAS+ funciona sin Internet?",
        answer: "La propuesta actual está pensada para funcionar mediante una conexión a Internet."
      }
    ]
  },


  accesibilidad: {
    title: "Accesibilidad",

    questions: [
      {
        question: "¿Por qué usar diferentes formas de acceso?",
        answer: "Porque no todas las personas interactúan con la tecnología de la misma manera. La plataforma busca ofrecer alternativas para que cada aprendiz pueda encontrar una forma de interacción más adecuada a sus necesidades."
      }
    ]
  }

};


/* =========================================================
   INICIALIZAR CHATBOT
========================================================= */

function initLaiaChat() {

  const chatButton = $('#laiaChatButton');
  const chat = $('#laiaChat');
  const closeButton = $('#laiaChatClose');

  const categories = $('#laiaCategories');
  const questions = $('#laiaQuestions');
  const answer = $('#laiaAnswer');

  const questionCategory = $('#laiaQuestionCategory');
  const questionList = $('#laiaQuestionList');

  const selectedQuestion = $('#laiaSelectedQuestion');
  const answerText = $('#laiaAnswerText');

  const backCategories = $('#laiaBackCategories');
  const backQuestions = $('#laiaBackQuestions');
  const moreQuestions = $('#laiaMoreQuestions');

  if (!chatButton || !chat) return;


  /* -------------------------------------------------------
     ABRIR
  ------------------------------------------------------- */

  chatButton.addEventListener('click', () => {

    chat.classList.add('open');
    chat.setAttribute('aria-hidden', 'false');

    showCategories();

  });


  /* -------------------------------------------------------
     CERRAR
  ------------------------------------------------------- */

  closeButton?.addEventListener('click', () => {

    chat.classList.remove('open');
    chat.setAttribute('aria-hidden', 'true');

  });


  /* -------------------------------------------------------
     CATEGORÍAS
  ------------------------------------------------------- */

  $$('.laia-category').forEach(button => {

    button.addEventListener('click', () => {

      const category = button.dataset.category;

      showQuestions(category);

    });

  });


  /* -------------------------------------------------------
     VOLVER A CATEGORÍAS
  ------------------------------------------------------- */

  backCategories?.addEventListener('click', () => {

    showCategories();

  });


  /* -------------------------------------------------------
     VOLVER A PREGUNTAS
  ------------------------------------------------------- */

  backQuestions?.addEventListener('click', () => {

    showQuestions(window.currentLaiaCategory);

  });


  /* -------------------------------------------------------
     OTRA PREGUNTA
  ------------------------------------------------------- */

  moreQuestions?.addEventListener('click', () => {

    showQuestions(window.currentLaiaCategory);

  });


  /* -------------------------------------------------------
     MOSTRAR CATEGORÍAS
  ------------------------------------------------------- */

  function showCategories() {

    categories.style.display = 'grid';

    questions.classList.remove('active');
    answer.classList.remove('active');

    questionList.innerHTML = '';

  }


  /* -------------------------------------------------------
     MOSTRAR PREGUNTAS
  ------------------------------------------------------- */

  function showQuestions(category) {

    const data = laiaChatData[category];

    if (!data) return;

    window.currentLaiaCategory = category;

    categories.style.display = 'none';

    questions.classList.add('active');
    answer.classList.remove('active');

    questionCategory.textContent = data.title;

    questionList.innerHTML = '';


    data.questions.forEach((item, index) => {

      const button = document.createElement('button');

      button.className = 'laia-question';

      button.type = 'button';

      button.textContent = item.question;

      button.addEventListener('click', () => {

        showAnswer(item);

      });

      questionList.appendChild(button);

    });

  }


  /* -------------------------------------------------------
     MOSTRAR RESPUESTA
  ------------------------------------------------------- */

  function showAnswer(item) {

    categories.style.display = 'none';

    questions.classList.remove('active');

    answer.classList.add('active');

    selectedQuestion.textContent = item.question;

    answerText.textContent = item.answer;

  }

}
function init(){
  setupQR();
  initReveal();
  initProgress();
  initTheme();
  initMenu();
  initIcons();
  initCounters();
  initAssetFallbacks();
  initLaiaChat();
}
init();
