const searchForm = document.querySelector('#search-form'),
    movie = document.querySelector('#movies'),
    moviePage = document.querySelector('#movie_page'),
    urlPoster = 'https://image.tmdb.org/t/p/w500',
    backMain = '<div id="to_back"><a href="./index.html"></a></div>';

const apiSearch = event => {
    event.preventDefault();
    const searchText = document.querySelector('.form-control').value;
    if (searchText.trim().length === 0) {
        movie.innerHTML = backMain + '<p class="error text_error">Заполните поле поиска!</p>';
        return;
    }
    movie.innerHTML = '<div class="spiner"></div>';


    fetch('https://api.themoviedb.org/3/search/multi?api_key=3ac9e9c4b5b41ada30de1c0b1e488050&language=ru&query=' + searchText)
        .then(value => {
            if (value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })

        .then(output => {
            console.log(output.results);
            let inner = '';


            if (output.results.length === 0) {
                inner = backMain + '<p class="error text_error">К сожалению, ничего не найдено :(</p>';
            }

            output.results.forEach(item => {
                if (item.media_type !== 'person') {
                    let nameItem = item.name || item.title;

                    let poster = item.poster_path ? urlPoster + item.poster_path : 'https://kinomaiak.ru/wp-content/uploads/2018/02/noposter.png';

                    let vote = item.vote_average;
                    if (item.vote_average >= 7) {
                        vote = `<span class="good">${item.vote_average}</span>`;
                    } else if (item.vote_average >= 5 && item.vote_average < 7) {
                        vote = `<span class="middle">${item.vote_average}</span>`;
                    } else {
                        vote = `<span class="bad">${item.vote_average}</span>`;
                    }

                    let releaseDate = (item.release_date || item.first_air_date).slice(0, 4);
                    let dataInfo = `data-id="${item.id}" data-type = "${item.media_type}"`;

                    inner += `
                    <div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 movie_item">
                        <div class="movie_box" ${dataInfo}>
                            <img src="${poster}" alt="${nameItem}" /></a>
                            <div class="title">${nameItem}</div>
                            <div class="vote">${vote}<span class="date">${releaseDate}</span></div>
                        </div>
                    </div>
                `;
                }
            });


            movie.innerHTML = inner;
            moviePage.classList.remove('active');
            movie.classList.remove('hidden');

            addEventMedia();
        })

        .catch(reason => {
            movie.innerHTML = backMain + '<p class="error">Упс, что-то пошло не так!</p>';
            console.error(reason || reason.status);
        })
    ;
};

searchForm.addEventListener('submit', apiSearch);

function addEventMedia() {
    const media = movie.querySelectorAll('.movie_box[data-id]');
    media.forEach(function (elem) {
        elem.style.cursor = 'pointer';
        elem.addEventListener('click', showFullInfo);
    });
}

function showFullInfo() {
    let url = '';
    if (this.dataset.type === 'movie') {
        url = 'https://api.themoviedb.org/3/movie/' + this.dataset.id + '?api_key=3ac9e9c4b5b41ada30de1c0b1e488050&language=ru';
    } else if (this.dataset.type === 'tv') {
        url = 'https://api.themoviedb.org/3/tv/' + this.dataset.id + '?api_key=3ac9e9c4b5b41ada30de1c0b1e488050&language=ru';
    } else {
        movie.innerHTML = backMain + '<p class="error">Упс, что-то пошло не так!</p>';
    }


    fetch(url)
        .then(value => {
            if (value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })

        .then(output => {
            console.log(output);
            let poster = output.poster_path ? urlPoster + output.poster_path : 'https://kinomaiak.ru/wp-content/uploads/2018/02/noposter.png';

            let vote = output.vote_average;
            if (output.vote_average >= 7) {
                vote = `<span class="good">${output.vote_average}</span>`;
            } else if (output.vote_average >= 5 && output.vote_average < 7) {
                vote = `<span class="middle">${output.vote_average}</span>`;
            } else {
                vote = `<span class="bad">${output.vote_average}</span>`;
            }

            let releaseDate = (output.release_date || output.first_air_date).slice(0, 4);
            let country = [];
            if (!output.last_air_date) {
                for (let i = 0; i < output.production_countries.length; i++) {
                    output.production_countries[i].name;
                    console.log(output.production_countries[i].name);
                    let countries = output.production_countries[i].name;
                    country.push(countries);
                }
            }

            moviePage.classList = 'active';
            let movieInfo = `
                <div class="title_item">
                    <h1>${output.name || output.title}</h1>
                    <p class="orig_name">${output.original_title || output.original_name}</p>
                </div>
                <div class="row">
                    <div class="col-4">
                        <div class="poster_img">
                            <img src="${poster}" alt"${output.name || output.title}" />
                        </div>
                    </div>
                    <div class="col-8">
                        <div class="full_desc">
                            <p class="vote">${vote}</p>
                            <div class="dop_info">
                                <p class="tagline">${output.tagline || ''}</p>
                                <p>Дата выхода: <span>${releaseDate}</span></p>
                                ${(output.last_episode_to_air) ? `<p>Длительность серии: <span>${(output.episode_run_time.join(', ')) + ' мин'}</span></p>` : `<p>Длительность: <span>${(output.runtime) + ' мин'}</span></p>`}
                                ${(output.last_episode_to_air) ? `<p>Количество сезонов: <span>${output.number_of_seasons}</span></p><p>Количество серий: <span>${output.number_of_episodes}</span></p>` : ''}
                                ${(!output.last_air_date) ? `<p>Страна: <span>${country.join(', ')}</span></p>` : ``}
                                ${(output.last_episode_to_air || output.budget.length === 0 || output.budget === 0) ? `` : `<p>Бюджет: <span>${(output.budget) + ' $'}</span></p>`}
                            </div>
                        </div>
                    </div>
                    ${(output.overview.length !== 0) ? `<div class="col-12"><p class="overview">${output.overview}</p></div>` : ``}
                    <div class="video col-12"></div> 
                    <div class="recommend_list"></div> 
                </div>
            `;

            moviePage.innerHTML += movieInfo;
            movie.classList = 'hidden row';

            getVideo(this.dataset.type, this.dataset.id);
            getRecommend(this.dataset.type, this.dataset.id);

            const backBtn = document.querySelector('#to_back');

            function closePage() {
                moviePage.classList.remove('active');
                movie.classList.remove('hidden');
                moviePage.innerHTML = '<div id="to_back"></div>';
            }

            backBtn.addEventListener('click', closePage);
        })

        .catch(reason => {
            movie.innerHTML = backMain + '<p class="error">Упс, что-то пошло не так!</p>';
            console.error(reason || reason.status);
        })
    ;
}

document.addEventListener('DOMContentLoaded', function () {
    fetch('https://api.themoviedb.org/3/trending/all/day?api_key=3ac9e9c4b5b41ada30de1c0b1e488050&language=ru')
        .then(value => {
            if (value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })

        .then(output => {
            let outputDayArr = output.results.splice(0, 3);
            console.log(outputDayArr);
            let inner = '<h1 class="col-12"><span>Популярное</span> за день</h1>';
            if (output.results.length === 0) {
                inner = '<p class="error text_error">К сожалению, ничего не найдено :(</p>';
            }
            outputDayArr.forEach(item => {
                let nameItem = item.name || item.title;
                let mediaType = item.title ? 'movie' : 'tv';

                let poster = item.poster_path ? urlPoster + item.poster_path : 'https://kinomaiak.ru/wp-content/uploads/2018/02/noposter.png';

                let vote = item.vote_average;
                if (item.vote_average >= 7) {
                    vote = `<span class="good">${item.vote_average}</span>`;
                } else if (item.vote_average >= 5 && item.vote_average < 7) {
                    vote = `<span class="middle">${item.vote_average}</span>`;
                } else {
                    vote = `<span class="bad">${item.vote_average}</span>`;
                }

                let releaseDate = (item.release_date || item.first_air_date).slice(0, 4);
                let dataInfo = `data-id="${item.id}" data-type = "${mediaType}"`;

                inner += `
                    <div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 movie_item">
                        <div class="movie_box" ${dataInfo}>
                            <img src="${poster}" alt="${nameItem}" /></a>
                            <div class="title">${nameItem}</div>
                            <div class="vote">${vote}<span class="date">${releaseDate}</span></div>
                        </div>
                    </div>
                `;
            });

            movie.innerHTML = inner;
            addEventMedia();
        })

        .catch(reason => {
            movie.innerHTML = backMain + '<p class="error">Упс, что-то пошло не так!</p>';
            console.error('error: ' + reason.status);
        })
    ;
    fetch('https://api.themoviedb.org/3/trending/all/week?api_key=3ac9e9c4b5b41ada30de1c0b1e488050&language=ru')
        .then(value => {
            if (value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })

        .then(output => {
            let outputDayArr = output.results.splice(0, 3);
            console.log(outputDayArr);
            let inner = '<h1 class="col-12"><span>Популярное</span> за неделю</h1>';
            if (output.results.length === 0) {
                inner = '<p class="error text_error">К сожалению, ничего не найдено :(</p>';
            }
            outputDayArr.forEach(item => {
                let nameItem = item.name || item.title;
                let mediaType = item.title ? 'movie' : 'tv';

                let poster = item.poster_path ? urlPoster + item.poster_path : 'https://kinomaiak.ru/wp-content/uploads/2018/02/noposter.png';

                let vote = item.vote_average;
                if (item.vote_average >= 7) {
                    vote = `<span class="good">${item.vote_average}</span>`;
                } else if (item.vote_average >= 5 && item.vote_average < 7) {
                    vote = `<span class="middle">${item.vote_average}</span>`;
                } else {
                    vote = `<span class="bad">${item.vote_average}</span>`;
                }

                let releaseDate = (item.release_date || item.first_air_date).slice(0, 4);
                let dataInfo = `data-id="${item.id}" data-type = "${mediaType}"`;

                inner += `
                    <div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 movie_item">
                        <div class="movie_box" ${dataInfo}>
                            <img src="${poster}" alt="${nameItem}" /></a>
                            <div class="title">${nameItem}</div>
                            <div class="vote">${vote}<span class="date">${releaseDate}</span></div>
                        </div>
                    </div>
                `;
            });

            movie.innerHTML += inner;
            addEventMedia();
        })

        .catch(reason => {
            movie.innerHTML = backMain + '<p class="error">Упс, что-то пошло не так!</p>';
            console.error('error: ' + reason.status);
        })
    ;
});

function getVideo(type, id) {
    let video = document.querySelector('.video');

    fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=3ac9e9c4b5b41ada30de1c0b1e488050&language=ru`)
        .then(value => {
            if (value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })

        .then(output => {
            for (let i = 0; i < output.results.length; i++) {
                console.log(output.results[i].key);
                video.innerHTML = `<iframe width="100%" height="526" src="https://www.youtube.com/embed/${output.results[i].key}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            }
        })
        .catch(reason => {
            video.innerHTML = `Видео отсутствует!`;
            console.error('error: ' + reason.status);
        })
    ;
}

function getRecommend(type, id) {
    let recommend = document.querySelector('.recommend_list');

    fetch(`https://api.themoviedb.org/3/${type}/${id}/recommendations?api_key=3ac9e9c4b5b41ada30de1c0b1e488050&language=ru&page=1`)
        .then(value => {
            if (value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })

        .then(output => {
            console.log(output);
            for (let i = 0; i < 4; i++) {
                console.log(output.results[i].poster_path);
                let nameItem = output.results[i].name || output.results[i].title;

                let poster = output.results[i].poster_path ? urlPoster + output.results[i].poster_path : 'https://kinomaiak.ru/wp-content/uploads/2018/02/noposter.png';

                let dataInfo = `data-id="${output.results[i].id}" data-type = "${output.results[i].media_type}"`;

                recommend.innerHTML += `
                    <div class="col-lg-3 col-md-6 col-sm-6 col-xs-12 movie_item">
                        <div class="movie_box" ${dataInfo}>
                            <img src="${poster}" alt="${nameItem}" /></a>
                            <div class="title">${nameItem}</div>
                        </div>
                    </div>
                `;
            }
        })
        .catch(reason => {
            recommend.innerHTML = `Видео отсутствует!`;
            console.error('error: ' + reason.status);
        })
    ;
}
