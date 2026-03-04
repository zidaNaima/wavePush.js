const btn = document.getElementsByClassName('expand-btn');

for (let i = 0; i < btn.length; i++) {
    btn[i].addEventListener('click', () => {

        for (let j = 0; j < btn.length; j++) {
            if (i != j)
            btn[j].nextElementSibling.classList.add('opacity-0');
        }

        btn[i].nextElementSibling.classList.toggle('opacity-0');
    });
}
