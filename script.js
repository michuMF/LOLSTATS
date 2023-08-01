// const testImg = document.querySelector(".test")

// const lastGameDiv = document.querySelector(".last-game")
// const iconsId = []
// const assasinsChamps = []
// const setIcons = (img, icon) => {
// 	img.setAttribute(
// 		"src",
// 		`http://ddragon.leagueoflegends.com/cdn/13.14.1/img/profileicon/${icon}.png`
// 	)
// }

// let champion = "Aatrox"
// const test = async function () {
// 	try {
// 		const oneChampion = `http://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/champion/${champion}.json`
// 		const myAcc = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/michuMF?api_key=${apiKey}`
// 		const games = `https://europe.api.riotgames.com/lol/match/v5/matches/EUN1_3414977262?api_key=${apiKey}`

// 		const response = await fetch(oneChampion)
// 		const response2 = await fetch(myAcc)

// 		const responseGames = await fetch(games)

// 		const myGames = await responseGames.json()
// 		const myData = await response2.json()

// 		const riotData = await response.json()

// 		const myIcon = myData.profileIconId
// 		const players = myGames.info.participants

// 		const playersId = seeId(players)

// 		for (const id of playersId) {
// 			const playerInfo = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${id}?api_key=${apiKey}`
// 			const response = await fetch(playerInfo)
// 			const playerStasts = await response.json()

// 			iconsId.push(playerStasts.profileIconId)
// 		}

// 		//setStats(players, iconsId)
// 	} catch (error) {
// 		console.log(error)
// 	}
// }

// const setStats = (arr, icons) => {
// 	let index = -1

// 	arr.forEach(player => {
// 		index++

// 		const div = document.createElement("div")
// 		const div2 = document.createElement("div")
// 		const div3 = document.createElement("div")
// 		const div4 = document.createElement("div")
// 		const summonerName = document.createElement("h1")
// 		const summonerLevel = document.createElement("p")
// 		const championName = document.createElement("h2")
// 		const summonerIcon = document.createElement("img")
// 		const championIcon = document.createElement("img")
// 		championIcon.setAttribute(
// 			"src",
// 			`http://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${player.championName}.png`
// 		)
// 		summonerIcon.setAttribute(
// 			"src",
// 			`http://ddragon.leagueoflegends.com/cdn/13.14.1/img/profileicon/${icons[index]}.png`
// 		)

// 		div.classList.add("player")
// 		div2.classList.add("name-sumonner")
// 		div3.classList.add("name-level")
// 		div4.classList.add("name-champion")
// 		summonerIcon.classList.add("icon")
// 		championIcon.classList.add("champ-icon")
// 		summonerName.textContent = `${player.summonerName} `
// 		championName.textContent = `${player.championName}`
// 		summonerLevel.textContent = `Level: ${player.summonerLevel}`

// 		lastGameDiv.appendChild(div)
// 		div.appendChild(div2)
// 		div2.appendChild(summonerIcon)
// 		div2.appendChild(div3)

// 		div.appendChild(div4)

// 		div3.appendChild(summonerName)
// 		div3.appendChild(summonerLevel)
// 		div4.append(championIcon)
// 		div4.append(championName)
// 	})
// }

// const seeId = arr => {
// 	const arrId = []
// 	arr.forEach(player => {
// 		let summonerName = player.summonerName
// 		const spacesRelaced = summonerName.replace(/ /g, "%20")

// 		arrId.push(spacesRelaced)
// 	})
// 	return arrId
// }

// const test2 = async function () {
// 	try {
// 		const url =
// 			"http://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/item.json"
// 		const response = await fetch(url)
// 		const items = await response.json()
// 		console.log(items)
// 	} catch {}
// }
