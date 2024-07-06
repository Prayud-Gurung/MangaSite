// scripts/index.js
$("#mangasite").click(function () {
    window.location.href = "/"
})

$("#random-btn").click(function () {
    fetch("/random-manga", {
        method: "get",
        headers: {
            "content-Type": "application/x-www-form-urlencoded"
        }
    })
})

//chapter.ejs
var pageIndex = 0
let pageNumber = 1


$("#chapter-page").on("click", function () {
    $(this).toggleClass("chapter-page-zoom")
})

$("#page-number").text(`Page: ${pageNumber}`)

$("#previous-btn").on("click", function () {
    if (pageIndex > 0) {
        pageIndex -= 1
        pageNumber -= 1
        $("#page-number").text(`Page: ${pageNumber}`)
        $("#chapter-page").attr("src", chapterPagesURL[pageIndex])
    }
})

$("#next-btn").on("click", function () {
    if (pageIndex < chapterPagesURL.length) {
        pageIndex += 1
        pageNumber += 1

        $("#page-number").text(`Page: ${pageNumber}`)
        $("#chapter-page").attr("src", chapterPagesURL[pageIndex])
    }
})
