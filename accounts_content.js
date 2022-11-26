async function scrapeModeratorNotes(url) {
    const response = await fetch(url);
    if (response.ok) {
        const pageText = await response.text();
        var doc = document.implementation.createHTMLDocument();
        doc.open();
        doc.write(pageText);
        doc.close();
        return getNotesFromPage(doc);
    } else {
        console.log(`Error getting response for ${url}`)
        return null;
    }
}

function getNotesFromPage(doc) {
    const noteNodes = doc.querySelectorAll("div.report-notes__item")
    if (noteNodes.length == 0) {
        return [];
    }
    var res = [];
    for (const note of noteNodes.values()) {
        var author = note.querySelector("span.username a").innerText;
        var text = note.querySelector("div.report-notes__item__content").innerText.trim();
        var time = note.querySelector("time").getAttribute("datetime")
        res.push({author:author, text:text, time:time})
    }

    return res;

}

function saveNotes(notes, key) {
    var storedObject = {
        checkDate: new Date().toUTCString(),
        id: key,
        notes: notes
    }
    window.localStorage.setItem(key, JSON.stringify(storedObject))
}

async function timeout(ms) {return new Promise(resolve=>window.setTimeout(resolve, ms))}

async function showModeratorNotes () {
    const pendingDivs = document.querySelectorAll(".batch-table__row--attention div.batch-table__row__content")
    for(let div of pendingDivs.values()) {
        let a = div.querySelector("a.account__display-name")
        let href = a.getAttribute("href");
        let key = /[^/]*$/.exec(href)[0];
        let cachedNotes = window.localStorage.getItem(key);
        let notes = null;
        if (cachedNotes) {
            cachedNotes = JSON.parse(cachedNotes);
            notes = cachedNotes.notes;
            //console.log(`loaded notes from storage`);
            //console.log(cachedNotes);
            const checkDate = new Date(cachedNotes.checkDate);
            const invalidTime = (notes == null || notes.length == 0) ? 5 * 60 * 1000 : 12 * 60 * 60 * 1000;
            if (new Date() - checkDate > invalidTime) {
                notes = null;
            }
        }
        if (notes == null) {
            console.log(`loading notes from ${href}`)
            notes = await scrapeModeratorNotes(href, key);
            saveNotes(notes, key);
            await timeout(500);
        }
        if (notes.length > 0) {
            for (i = 0; i < notes.length; i++) {
                let note = notes[i];
                let d = document.createElement("div");
                d.innerText = `${note.author}: ${note.text} (${new Date(note.time).toLocaleDateString()})`;
                d.classList.add("batch-table__row__content__quote", "report-notes__item__content")
                div.appendChild(d);
            }
        }
    }    
}

if (window.location.pathname == "/admin/accounts") {
    showModeratorNotes().then(()=>console.log("showed notes"))
} else if (/\/admin\/accounts\/[^/]+$/.test(window.location.pathname)) {
    let key = /[^/]*$/.exec(window.location.pathname)[0];
    saveNotes(getNotesFromPage(document), key);    
}
