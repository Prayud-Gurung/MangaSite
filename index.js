// index.js
import express from "express"
import axios from "axios"
import rateLimit from "axios-rate-limit"
const app = express()
const port =  process.env.PORT || 3100;

const baseUrl = "https://api.mangadex.org"
const coverUrl = "https://uploads.mangadex.org"

const api = rateLimit(axios.create(), {
    headers: {
        'User-Agent': 'mangasite/1.0',
        'Content-Type': 'application/json'
    },
    maxRequests: 5,
    perMilliseconds: 1000
})

app.use(express.static("public"))

app.get("/", async function(req, res){
    let mangas = []
    try{
        const result = await api.get(`${baseUrl}/manga?limit=20&offset=0&status[]=completed&status[]=ongoing&publicationDemographic[]=shounen&contentRating[]=safe&hasAvailableChapters=true`)
        const output = result.data

        mangas = await Promise.all(
            output.data.map(async function(element){
                const coverArt = element.relationships.find(coverArt => coverArt.type === "cover_art");
                const coverFilename = await GetCoverFilename(coverArt.id);
                const coverArtUrl = `${coverUrl}/covers/${element.id}/${coverFilename}.512.jpg`;
      
            return {
              manga: element,
              coverArtSrc: coverArtUrl
            }
        }))
        // output.data.forEach(async function(element) {
        //     const coverArt = element.relationships.find(coverArt => coverArt.type === "cover_art")

        //     const coverFilename  = await GetCoverFilename(coverArt.id)
        //     console.log(coverFilename);

        //     const coverArtUrl = `${coverUrl}/${element.id}/${coverFilename}`

        //     mangas.push({
        //         manga: element,
        //         coverArtScr: coverArtUrl
        //     })
        // });
        
        res.render("index.ejs", {mangas: mangas})
    } catch(error){
        console.error(`Error: ${error}`);
    }
})

app.get("/random-manga", async function(req, res){
    try{
        const result = await api.get(`${baseUrl}/manga/random`)
        console.log(result.data);
    } catch(error){
        console.error(`Error: ${error}`);
    }
})

app.get("/get-manga", async function(req, res){
    const mangaDetail = JSON.parse(req.query.mangaDetail)
    const mangaId =  mangaDetail.manga.id

    try{
        const mangaChapters = await getMangaChapters(mangaId)

        res.render("manga.ejs", {
            mangaId: mangaId,
            mangaTitle: mangaDetail.manga.attributes.title.en,
            mangaCover: mangaDetail.coverArtSrc,
            mangaDesc: mangaDetail.manga.attributes.description.en,
            status: mangaDetail.manga.attributes.status,
            tags: mangaDetail.manga.attributes.tags,
            year: mangaDetail.manga.attributes.year,
            genre: mangaDetail.manga.attributes.publicationDemographic,
            artist: mangaDetail.manga.relationships.artist ? artist.attributes.name : 'Unknown',
            author: mangaDetail.manga.relationships.author ? author.attributes.name : 'Unknown',

            chapters: mangaChapters
        })
    } catch(error){
        console.error(`Error: ${error}`)
    }
})

app.get("/get-chapter/:chapterId", async function(req, res){
    const chapterId = req.params.chapterId

    const mangaName = req.query.mangaName
    const mangaVolume = req.query.mangaVolume
    const mangaChapter = req.query.mangaChapter
    try{
        const result = await axios.get(`${baseUrl}/at-home/server/${chapterId}`)
        const output = result.data

        const chapterHash = output.chapter.hash
        const goodQuality = output.chapter.data.map(element => {
            return `${coverUrl}/data/${chapterHash}/${element}`
        })
        const badQuality = output.chapter.dataSaver.map(element => {
            return `${coverUrl}/data/${chapterHash}/${element}`
        })

        res.render("chapter.ejs", {
            mangaName: mangaName,
            mangaVolume: mangaVolume,
            mangaChapter: mangaChapter,
            chapterPagesURL: goodQuality
        })
    } catch(error){
        console.error(`Error: ${error}`)
    }
})

app.listen(port, "0.0.0.0", function(){
    console.log(`Server running on ${port}`);
})

async function GetCoverFilename(coverId){
    try{
        const result = await api.get(`${baseUrl}/cover/${coverId}`)
        const output = result.data
        return output.data.attributes.fileName
    } catch(error){
        console.log("Error" + error);
    }
}

async function getMangaChapters(mangaId){
    try{
        const result = await axios.get(`${baseUrl}/manga/${mangaId}/feed?order[volume]=asc&order[chapter]=asc`)
        const output = result.data
        return(output.data)
    } catch(error){
        console.error(`Error: ${error}`)
    }
}