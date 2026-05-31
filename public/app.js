document.addEventListener('DOMContentLoaded', () => {
    loadCoach();
    loadTitles();
    loadSquad();
    loadLegends();
    initBackToTop();
});

// URL de tu bucket en Google Cloud donde el backend dejará los datos frescos 1 vez al día
const BACKEND_URL = 'https://storage.googleapis.com/api-data-boca-497814/api_data.json';

// 0. DT Actual
async function loadCoach() {
    const coachContainer = document.getElementById('current-coach-grid');
    if (!coachContainer) return;

    try {
        // Consumimos directamente nuestro propio backend consolidado
        const response = await fetch(BACKEND_URL);
        const data = await response.json();

        coachContainer.innerHTML = '';

        // Tarjeta: DT Actual
        if (data.coach.response && data.coach.response.length > 0) {
            // Buscamos el DT que no tenga fecha de finalización o tomamos el último del historial
            const currentCoach = data.coach.response.find(c => c.career.some(car => car.team.id === 451 && car.end === null)) || data.coach.response[data.coach.response.length - 1];
            
            const card = document.createElement('div');
            card.className = 'card match-card';
            card.innerHTML = `
                <h3>Director Técnico</h3>
                <img src="${currentCoach.photo}" alt="${currentCoach.name}" class="player-img" style="margin-top: 1rem;">
                <h3 class="player-name" style="color: var(--white);">${currentCoach.name}</h3>
                <div class="player-details" style="justify-content: center; gap: 1.5rem; border-top: none;">
                    <p><strong>Nacionalidad:</strong> <span class="badge primary">${currentCoach.nationality || 'N/A'}</span></p>
                    <p><strong>Edad:</strong> <span class="badge secondary">${currentCoach.age || 'N/A'}</span></p>
                </div>
            `;
            
            coachContainer.appendChild(card);
        }

    } catch (error) {
        console.error('Error cargando DT:', error);
        coachContainer.innerHTML = '<p>Error al cargar el DT. Revisa tu conexión a internet.</p>';
    }
}

// 1. Palmarés Histórico
async function loadTitles() {
    try {
        const response = await fetch('titles.json');
        const titles = await response.json();
        
        const gridInt = document.getElementById('titles-international-grid');
        const gridNac = document.getElementById('titles-national-grid');
        
        // Ordenamos los títulos del más reciente al más antiguo
        titles.sort((a, b) => b.año - a.año);

        // --- NUEVO: ÚLTIMOS 10 TÍTULOS ---
        const latestTitles = titles.slice(0, 10);
        const gridLatest = document.getElementById('latest-titles-grid');
        latestTitles.forEach(t => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3 style="font-size:1.1rem; margin-bottom: 0.5rem;">🏆 ${t.nombre}</h3>
                <p style="font-size: 1.5rem; color: var(--boca-yellow); font-weight: 800; margin-top:0;">${t.año}</p>
                <p><span class="badge ${t.categoria === 'Internacional' ? 'primary' : 'secondary'}">${t.categoria}</span></p>
                <div class="title-history" style="margin-top: 1rem; border:none; padding:0;">
                    <p style="font-size:0.85rem; color: var(--text-light); margin:0;"><strong>DT:</strong> ${t.dt !== 'N/A' ? t.dt : 'Sin DT'}</p>
                </div>
            `;
            gridLatest.appendChild(card);
        });

        // Agrupamos los títulos por nombre
        const grouped = {};
        titles.forEach(title => {
            if (!grouped[title.nombre]) {
                grouped[title.nombre] = { nombre: title.nombre, categoria: title.categoria, victorias: [] };
            }
            grouped[title.nombre].victorias.push(title);
        });

        // Convertimos a array y ordenamos por cantidad de títulos (de mayor a menor)
        const groupedArray = Object.values(grouped).sort((a, b) => b.victorias.length - a.victorias.length);

        groupedArray.forEach(group => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const victoriasHtml = group.victorias.map(v => `
                <div class="title-history-item">
                    <span class="year">${v.año}</span>
                    <span class="dt">👔 ${v.dt !== 'N/A' ? v.dt : 'Era Amateur'}</span>
                </div>
            `).join('');

            card.innerHTML = `
                <h3>🏆 ${group.nombre} (${group.victorias.length})</h3>
                <div style="margin-bottom: 1rem;">
                    <span class="badge primary">${group.categoria}</span>
                </div>
                <div class="title-history">
                    ${victoriasHtml}
                </div>
            `;
            
            if (group.categoria === 'Internacional') {
                gridInt.appendChild(card);
            } else {
                gridNac.appendChild(card);
            }
        });
    } catch (error) {
        console.error('Error cargando los títulos:', error);
    }
}

// 2. Plantel Actual (Conectado a API-Football)
async function loadSquad() {
    const container = document.getElementById('squad-container');

    try {
        // Consumimos directamente nuestro propio backend consolidado
        const response = await fetch(BACKEND_URL);
        const data = await response.json();
        
        if (data.squad && data.squad.response && data.squad.response.length > 0) {
            const players = data.squad.response[0].players;
            container.innerHTML = ''; // Limpiamos el texto de carga
            
            const translations = {
                'Goalkeeper': 'Arqueros',
                'Defender': 'Defensores',
                'Midfielder': 'Mediocampistas',
                'Attacker': 'Delanteros'
            };
            
            const groupedPlayers = { 'Arqueros': [], 'Defensores': [], 'Mediocampistas': [], 'Delanteros': [] };
            
            players.forEach(p => {
                const posES = translations[p.position] || 'Otros';
                if(groupedPlayers[posES]) groupedPlayers[posES].push(p);
            });

            for (const [position, squadList] of Object.entries(groupedPlayers)) {
                if (squadList.length > 0) {
                    const sectionTitle = document.createElement('h3');
                    sectionTitle.className = 'subsection-title mt-3';
                    sectionTitle.innerText = position;
                    container.appendChild(sectionTitle);

                    const grid = document.createElement('div');
                    grid.className = 'grid';
                    squadList.forEach(player => {
                        const card = document.createElement('div');
                        card.className = 'card';
                        card.innerHTML = `
                            <img src="${player.photo}" alt="${player.name}" class="player-img">
                            <h3 class="player-name">${player.name}</h3>
                            <div class="player-details">
                                <p><strong>Edad:</strong> ${player.age ? player.age + ' años' : 'N/A'}</p>
                                <p><strong>Dorsal:</strong> <span class="badge secondary">${player.number || '-'}</span></p>
                            </div>
                        `;
                        grid.appendChild(card);
                    });
                    container.appendChild(grid);
                }
            }
            
            // --- NUEVO: Estadísticas del Plantel ---
            const statsGrid = document.getElementById('squad-stats-grid');
            if (statsGrid) {
                const validPlayers = players.filter(p => p.age);
                if (validPlayers.length > 0) {
                    const sortedByAge = [...validPlayers].sort((a, b) => a.age - b.age);
                const top10Youngest = sortedByAge.slice(0, 10);
                const top10Oldest = [...validPlayers].sort((a, b) => b.age - a.age).slice(0, 10);

                const youngestHtml = top10Youngest.map((p, i) => `
                    <div class="title-history-item" style="justify-content: flex-start; gap: 1rem;">
                        <span class="year" style="width: 30px; text-align: center; padding: 0.2rem;">#${i + 1}</span>
                        <img src="${p.photo}" alt="${p.name}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 1px solid var(--boca-yellow);">
                        <span class="dt" style="flex-grow: 1; text-align: left;">${p.name}</span>
                        <span class="badge secondary" style="margin: 0;">${p.age} años</span>
                    </div>
                `).join('');

                const oldestHtml = top10Oldest.map((p, i) => `
                    <div class="title-history-item" style="justify-content: flex-start; gap: 1rem;">
                        <span class="year" style="width: 30px; text-align: center; padding: 0.2rem;">#${i + 1}</span>
                        <img src="${p.photo}" alt="${p.name}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 1px solid var(--boca-yellow);">
                        <span class="dt" style="flex-grow: 1; text-align: left;">${p.name}</span>
                        <span class="badge secondary" style="margin: 0;">${p.age} años</span>
                    </div>
                `).join('');

                    statsGrid.innerHTML = `
                    <div class="card">
                        <h3 style="color: var(--boca-yellow); margin-bottom: 1.5rem;">Top 10 Más Jóvenes 👶</h3>
                        <div class="title-history" style="max-height: none; overflow: visible; border: none;">
                            ${youngestHtml}
                        </div>
                    </div>
                    <div class="card">
                        <h3 style="color: var(--boca-yellow); margin-bottom: 1.5rem;">Top 10 Más Experimentados 🦁</h3>
                        <div class="title-history" style="max-height: none; overflow: visible; border: none;">
                            ${oldestHtml}
                        </div>
                        </div>
                    `;
                }
            }
        }
    } catch (error) {
        console.error('Error cargando el plantel:', error);
        container.innerHTML = '<p>Ocurrió un error al cargar los datos del plantel. Revisa tu conexión.</p>';
    }
}

// 3. Ídolos y Leyendas
function loadLegends() {
    // Ídolos eternos del club
    const idolosEternos = [
        { nombre: "Juan Román Riquelme", apodo: "El Último Diez", rol: "Jugador", logros: "Máximo ídolo de la historia. Magia pura, 3 Libertadores, 1 Intercontinental frente al Real Madrid." },
        { nombre: "Diego A. Maradona", apodo: "D10S / Pelusa", rol: "Jugador", logros: "El mejor jugador de todos los tiempos. Hincha fanático, llevó a Boca en la sangre." },
        { nombre: "Carlos Bianchi", apodo: "El Virrey", rol: "Director Técnico", logros: "El DT más grande. Nos hizo tocar el cielo con las manos en el 2000 y 2003." },
        { nombre: "Martín Palermo", apodo: "El Titán", rol: "Jugador", logros: "Máximo goleador histórico (236 goles). Películas de goles épicos y heroicos." },
        { nombre: "Carlos Tevez", apodo: "El Apache", rol: "Jugador", logros: "El jugador del pueblo. Dejó la gloria en Europa por amor a la camiseta." },
        { nombre: "Ángel Clemente Rojas", apodo: "Rojitas", rol: "Jugador", logros: "Ídolo de la vieja escuela. Gambeta, potrero y pura identidad xeneize." }
    ];

    // Top 10 Jugadores Más Ganadores
    const topPlayers = [
        { nombre: "Sebastián Battaglia", titulos: 17, detalle: "4 Libertadores (00, 01, 03, 07)<br>2 Intercontinentales (00, 03)<br>3 Recopas (05, 06, 08)<br>1 Sudamericana (05)<br>7 Ligas Locales" },
        { nombre: "Guillermo B. Schelotto", titulos: 16, detalle: "4 Libertadores (00, 01, 03, 07)<br>2 Intercontinentales (00, 03)<br>2 Recopas (05, 06)<br>2 Sudamericanas (04, 05)<br>6 Ligas Locales" },
        { nombre: "Hugo Ibarra", titulos: 15, detalle: "4 Libertadores (00, 01, 03, 07)<br>1 Intercontinental (00)<br>3 Recopas (05, 06, 08)<br>1 Sudamericana (05)<br>6 Ligas Locales" },
        { nombre: "Roberto Abbondanzieri", titulos: 14, detalle: "3 Libertadores (00, 01, 03)<br>2 Intercontinentales (00, 03)<br>1 Recopa (05)<br>2 Sudamericanas (04, 05)<br>6 Ligas Locales" },
        { nombre: "Martín Palermo", titulos: 14, detalle: "2 Libertadores (00, 07)<br>1 Intercontinental (00)<br>2 Recopas (06, 08)<br>2 Sudamericanas (04, 05)<br>6 Ligas Locales" },
        { nombre: "José María Calvo", titulos: 12, detalle: "2 Libertadores (01, 03)<br>1 Intercontinental (03)<br>2 Recopas (05, 06)<br>2 Sudamericanas (04, 05)<br>5 Ligas Locales" },
        { nombre: "Juan Román Riquelme", titulos: 11, detalle: "3 Libertadores (00, 01, 07)<br>1 Intercontinental (00)<br>1 Recopa (08)<br>5 Ligas (98, 99, 00, 08, 11)<br>1 Copa Argentina (12)" },
        { nombre: "Carlos Tevez", titulos: 11, detalle: "1 Libertadores (03)<br>1 Intercontinental (03)<br>1 Sudamericana (04)<br>5 Ligas (03, 15, 17, 18, 20)<br>1 Copa Arg (15)<br>1 Supercopa (18)<br>1 Copa Maradona (20)" },
        { nombre: "Rolando Schiavi", titulos: 9, detalle: "1 Libertadores (03)<br>1 Intercontinental (03)<br>1 Recopa (05)<br>1 Sudamericana (04)<br>4 Ligas Locales<br>1 Copa Argentina (12)" },
        { nombre: "Marcelo Delgado", titulos: 9, detalle: "3 Libertadores (00, 01, 03)<br>1 Intercontinental (00)<br>1 Recopa (05)<br>1 Sudamericana (04)<br>3 Ligas Locales" }
    ];

    // Top 5 Máximos Goleadores
    const topScorers = [
        { nombre: "Martín Palermo", goles: 236, detalle: "El Optimista del Gol. Hizo goles de todos los colores: de mitad de cancha, de cabeza desde 40 metros, con los ligamentos rotos y en muletas." },
        { nombre: "Roberto Cherro", goles: 218, detalle: "Cabecita de Oro. Gran goleador de la era amateur y principios del profesionalismo (1926-1938)." },
        { nombre: "Francisco Varallo", goles: 194, detalle: "Cañoncito. Símbolo indiscutido de la década del 30 y dueño de una potencia inigualable." },
        { nombre: "Domingo Tarasconi", goles: 193, detalle: "El Rey de la Doble Visera. Goleador implacable en los años 20 y protagonista de la gira europea del 25." },
        { nombre: "Jaime Sarlanga", goles: 129, detalle: "Piraña. Elegancia y eficacia pura durante la gloriosa década de 1940." }
    ];

    // Top 10 DTs Más Ganadores
    const topCoaches = [
        { nombre: "Carlos Bianchi", titulos: 9, detalle: "3 Libertadores (00, 01, 03)<br>2 Intercontinentales (00, 03)<br>4 Ligas (98, 99, 00, 03)" },
        { nombre: "Mario Fortunato", titulos: 6, detalle: "4 Ligas (30, 31, 34, 35)<br>1 Copa Británica (46)<br>1 Copa Confraternidad (46)" },
        { nombre: "Juan Carlos Lorenzo", titulos: 5, detalle: "2 Libertadores (77, 78)<br>1 Intercontinental (77)<br>2 Ligas (76, 76)" },
        { nombre: "Alfio Basile", titulos: 5, detalle: "2 Ligas (05, 06)<br>1 Sudamericana (05)<br>2 Recopas (05, 06)" },
        { nombre: "Alfredo Garasini", titulos: 3, detalle: "2 Ligas (43, 44)<br>1 Copa Ibarguren (44)" },
        { nombre: "Miguel Ángel Russo", titulos: 2, detalle: "1 Libertadores (07)<br>1 Copa de la Liga (20)" },
        { nombre: "O. Washington Tabárez", titulos: 2, detalle: "1 Liga (92)<br>1 Copa Master (92)" },
        { nombre: "Carlos Ischia", titulos: 2, detalle: "1 Liga (08)<br>1 Recopa (08)" },
        { nombre: "Julio C. Falcioni", titulos: 2, detalle: "1 Liga (11)<br>1 Copa Argentina (12)" },
        { nombre: "Sebastián Battaglia", titulos: 2, detalle: "1 Copa Argentina (21)<br>1 Copa de la Liga (22)" }
    ];

    // Top Presidentes Más Ganadores
    const topPresidents = [
        { nombre: "Mauricio Macri", titulos: 16, detalle: "La era dorada (1995-2007). 4 Libertadores, 2 Intercontinentales, 2 Sudamericanas, 2 Recopas, 6 Ligas Locales." },
        { nombre: "Alberto J. Armando", titulos: 12, detalle: "El Puma (1954-55, 1960-80). 2 Libertadores, 1 Intercontinental, 1 Copa Argentina, 8 Ligas Locales." },
        { nombre: "Daniel Angelici", titulos: 6, detalle: "Dos mandatos (2011-19). 3 Ligas Locales, 2 Copas Argentina, 1 Supercopa Argentina." },
        { nombre: "Jorge Amor Ameal", titulos: 6, detalle: "Dos ciclos (2008-11, 2019-23). 3 Ligas Locales, 1 Copa Argentina, 1 Supercopa, 1 Copa de la Liga." },
        { nombre: "Antonio Alegre", titulos: 5, detalle: "Salvó al club de la quiebra (1985-95). 1 Supercopa, 1 Recopa, 1 Copa Master, 1 Copa de Oro, 1 Liga." }
    ];

    const generalGrid = document.getElementById('general-idols-grid');
    const playersGrid = document.getElementById('legends-grid');
    const scorersGrid = document.getElementById('scorers-grid');
    const coachesGrid = document.getElementById('coaches-grid');
    const presidentsGrid = document.getElementById('presidents-grid');

    // 1. Ídolos Eternos
    idolosEternos.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${p.nombre} ("${p.apodo}")</h3>
            <p><span class="badge primary">${p.rol}</span></p>
            <p style="margin-top: 1rem;"><strong>El diferencial:</strong> ${p.logros}</p>
        `;
        generalGrid.appendChild(card);
    });

    // 2. Top 10 Jugadores
    topPlayers.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="rank-number">#${index + 1}</div>
            <h3>${p.nombre}</h3>
            <p style="margin-top: 1.5rem; margin-bottom: 1rem; font-size: 1.1rem;">
                <span class="badge secondary">🏆 ${p.titulos} Títulos Oficiales</span>
            </p>
            <div class="title-history">
                <p style="font-size: 0.9rem; color: var(--text-light); line-height: 1.6; margin: 0;">${p.detalle}</p>
            </div>
        `;
        playersGrid.appendChild(card);
    });

    // 2.5 Top 5 Goleadores
    topScorers.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="rank-number">#${index + 1}</div>
            <h3>${p.nombre}</h3>
            <p style="margin-top: 1.5rem; margin-bottom: 1rem; font-size: 1.1rem;">
                <span class="badge secondary">⚽ ${p.goles} Goles Oficiales</span>
            </p>
            <div class="title-history">
                <p style="font-size: 0.9rem; color: var(--text-light); line-height: 1.6; margin: 0;">${p.detalle}</p>
            </div>
        `;
        scorersGrid.appendChild(card);
    });

    // 3. Top 10 Técnicos
    topCoaches.forEach((c, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="rank-number">#${index + 1}</div>
            <h3>${c.nombre}</h3>
            <p style="margin-top: 1.5rem; margin-bottom: 1rem; font-size: 1.1rem;">
                <span class="badge secondary">🏆 ${c.titulos} Títulos Oficiales</span>
            </p>
            <div class="title-history">
                <p style="font-size: 0.9rem; color: var(--text-light); line-height: 1.6; margin: 0;">${c.detalle}</p>
            </div>
        `;
        coachesGrid.appendChild(card);
    });

    // 4. Presidentes
    topPresidents.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="rank-number">#${index + 1}</div>
            <h3>🏢 ${p.nombre}</h3>
            <p style="margin-top: 1.5rem; margin-bottom: 1rem; font-size: 1.1rem;">
                <span class="badge secondary">🏆 ${p.titulos} Títulos en su gestión</span>
            </p>
            <div class="title-history">
                <p style="font-size: 0.9rem; color: var(--text-light); line-height: 1.6; margin: 0;">${p.detalle}</p>
            </div>
        `;
        presidentsGrid.appendChild(card);
    });
}

// 4. Funcionalidad Botón Volver Arriba
function initBackToTop() {
    const btnTop = document.getElementById('btn-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btnTop.classList.add('show');
        } else {
            btnTop.classList.remove('show');
        }
    });

    btnTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}