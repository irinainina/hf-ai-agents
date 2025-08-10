const params = new URLSearchParams(window.location.search);
const file = params.get('file');

if (file) {
  fetch(`markdown/${file}`)
    .then((res) => (res.ok ? res.text() : Promise.reject('Файл не найден')))
    .then((text) => {
      document.getElementById('content').innerHTML = marked.parse(text);

      const currentIndex = lessons.findIndex((lesson) => lesson.file === file);

      if (currentIndex !== -1) {
        document.title = lessons[currentIndex].title;

        const nav = document.createElement('div');
        nav.style.marginTop = '2em';
        nav.style.display = 'flex';
        nav.style.justifyContent = 'space-between';
        
        if (currentIndex > 0) {
          const prev = lessons[currentIndex - 1];
          const prevBtn = document.createElement('a');
          prevBtn.href = `file-viewer.html?file=${prev.file}`;
          prevBtn.textContent = `← ${prev.title}`;
          nav.appendChild(prevBtn);
        } else {
          nav.appendChild(document.createElement('span'));
        }

        if (currentIndex < lessons.length - 1) {
          const next = lessons[currentIndex + 1];
          const nextBtn = document.createElement('a');
          nextBtn.href = `file-viewer.html?file=${next.file}`;
          nextBtn.textContent = `${next.title} →`;
          nav.appendChild(nextBtn);
        }

        document.getElementById('content').appendChild(nav);
      }
    })
    .catch((err) => {
      document.getElementById(
        'content'
      ).innerHTML = `<p style="color:red;">Ошибка: ${err}</p>`;
    });
}
