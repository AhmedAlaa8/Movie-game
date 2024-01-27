const letters = "ذضصثقفغعهخحجدطكمنتالبيسشءئؤرىةوزظ";

// const letters = "abcdefghijklmnopqrstuvwxyz";



let spacer = 0;
let wrong = 0;
let right = 0;
let sendd = 0;

let input = document.querySelector('.inpu');
let send = document.querySelector('.send');
let letsend = document.querySelector('.letsend');
let show = document.querySelector('.show');
let hiden = document.querySelector('.hiden');
let wrongtiltle = document.querySelector('.wrong');
let dess = document.querySelector('.dess');
let audioo = document.querySelector('.audioo');
let audiotwo = document.querySelector('.audiotwo');
let audioletter = document.querySelector('.audioletter');
let audioletterw = document.querySelector('.audioletterw');


let x = document.querySelector('.seat');
let c = document.querySelector('.colum');
let s = document.querySelector('.seattop');
let p = document.querySelector('.preg');
let s1 = document.querySelector('.stand');
let m = document.querySelector('.man');



let Arraylatters = Array.from(letters);

let lettercon = document.querySelector(".letter");

lettercon.style.pointerEvents = "none"
// console.log(Arraylatters);

Arraylatters.forEach(letter => {

    let letterspan = document.createElement("span");

    let theletter = document.createTextNode(letter)

    letterspan.appendChild(theletter)

    letterspan.className = "letterspan"


    lettercon.appendChild(letterspan)




})


send.addEventListener('click', () => {

    let lettervalue = Array.from(input.value);
    let letlenth = lettervalue.length;
    document.querySelector('.inpu').type = "password";



    lettervalue.forEach(letter => {




        let span = document.createElement('span');
        let thel = document.createTextNode(letter);

        span.className = 'spanletter';
        letsend.appendChild(span);

        if (letter == " ") {
            span.classList.add("space")
            spacer++;

        }

    })


    if (input.value != "") {


        lettercon.style.pointerEvents = "auto"
        send.classList.add("clicked")
        input.classList.add("clicked")
        show.classList.add("clicked")
        hiden.classList.add("clicked")
        dess.classList.add("clicked")
        dess.style.display = "none";

        x.style.display = "none";
        c.style.display = "none";
        s.style.display = "none";
        p.style.display = "none";
        s1.style.display = "none";
        m.style.display = "none";

        sendd = 1;



    } else {



        if (dess.style.display == "block") {

            location.reload()
        }
        dess.style.display = "block";

    }


})


document.addEventListener('click', (e) => {


    if (e.target.className == "letterspan") {
        let stutus = false;
        e.target.classList.add("clicked")
        let letterclick = e.target.innerHTML.toLowerCase();

        let lettervalue = Array.from(input.value);
        let letspan = document.querySelectorAll('.spanletter');
        let arrspan = Array.from(letspan);


        lettervalue.forEach((letter, index) => {


            if (letterclick == letter) {


                stutus = true;
                right++
                document.querySelector('.row').classList.add(`right${right}`)

                arrspan.forEach((span, spanindex) => {

                    if (index === spanindex) {
                        audioletter.playbackRate = 3.5;
                        audioletter.play();

                        span.innerHTML = letter;

                    }

                })
            }
        })

        if (stutus === false) {




            wrong++;
            document.querySelector('.row').classList.add(`wrong${wrong}`)


            if (wrong == 1) {

                audioletterw.playbackRate = 3.5;
                audioletterw.play();

                x.style.display = "";
            }
            if (wrong == 2) {

                audioletterw.play();
                c.style.display = "";
            }
            if (wrong == 3) {

                audioletterw.play();
                s.style.display = "";
                p.style.display = "";
                s1.style.display = "";
            }
            if (wrong == 4) {

                m.style.display = "";
                audioletterw.play();
            }

            wrongtiltle.textContent = "Worng -- " + wrong;
        }

        if (right === Array.from(input.value).length - spacer) {

            lettercon.classList.add("finshr");
            document.querySelector('.finshgame').classList.add("gameover");
            document.querySelector('.finshgame').textContent = `Congrats! .. ${input.value} ..`;

            audiotwo.play();
            setTimeout(() => {
                location.reload()
            }, 2500);

        }
    };


    if (wrong == 4) {

        lettercon.classList.add("finsh");
        document.querySelector('.finshgame').classList.add("gameover");
        document.querySelector('.finshgame').textContent = `Game Over .. ${input.value} ..`;
        document.querySelector('.finshgame').style.backgroundColor = "#ed0909";

        audioo.play();
        setTimeout(() => {
            location.reload()
        }, 2500);

    }


})


document.addEventListener("click", (e) => {




    if (e.target.classList[1] == "fa-eye" || e.target.className.animVal == "" || e.target.classList[1] == "fa-eye-slash") {


        if (document.querySelector('.inpu').type == "password") {


            document.querySelector('.inpu').type = "text";

            document.querySelector('.hiden').style.display = "block";
            document.querySelector('.show').style.display = "none";



        }
        else {

            document.querySelector('.show').style.display = "block";
            document.querySelector('.hiden').style.display = "none";

            document.querySelector('.inpu').type = "password"
        }

    }


    send.addEventListener("click", () => {


        document.querySelector('.hiden').style.display = "none";
        document.querySelector('.show').style.display = "none";

    })


})

