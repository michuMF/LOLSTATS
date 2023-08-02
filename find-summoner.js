const expand = document.querySelector(".fa-chevron-down")
const roll = document.querySelector(".fa-chevron-up")
const popUpRegions = document.querySelector(".pop-up-regions")
const regions = document.querySelectorAll(".name-region ")
const selectedRegion = document.querySelector(".selected-region")
const summonerIcon = document.querySelector(".summoner-icon")
const searchIcon = document.querySelector(".fa-magnifying-glass")
const summonerInfoDiv = document.querySelector(".summoner-top")
let regionName = selectedRegion.textContent
let regionNamePuId = ""

const summonerName = document.querySelector(".summoner-name")
const summonerLevel = document.querySelector(".summoner-level")
const summonerTier = document.querySelector(".summoner-tier")
const summonerRank = document.querySelector(".summoner-rank")
const summonerWR = document.querySelector(".summoner-wr")
const errorInfo = document.querySelector(".error-summoner")
const historyGame = document.querySelector(".history-game")
const showHistoryBtn = document.querySelector(".history-game-btn")
const hiddeHistroyGamesBtn = document.querySelector(".history-game-btn-hidde")
const lastGames = document.querySelector(".last-games")
const wrrapperHistoryGames = document.querySelector(".wrapper4")
const inputFind = document.querySelector(".find-acc")
const findSummoner = async function () {
	try {
		historyGame.classList.remove("hidden")
		hiddeHistroyGamesBtn.classList.add("hidden")
		showHistoryBtn.classList.remove("hidden")
		const urlRunes = `https://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/runesReforged.json`
		const responseRuens = await fetch(urlRunes)
		const runesData = await responseRuens.json()

		lastGames.innerHTML = ""
		summonerInfoDiv.classList.remove("hidden")
		let apiRegion = ""
		if (regionName === "EUNE") {
			regionNamePuId = "europe"
			apiRegion = "eun1"
		} else if (regionName === "EUW") {
			regionNamePuId = "europe"
			apiRegion = "euw1"
		} else if (regionName === "NA") {
			regionNamePuId = "americas"
			apiRegion = "na1"
		} else if (regionName === "KR") {
			regionNamePuId = "asia"
			apiRegion = "kr"
		}

		const urlSumonner = `https://${apiRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${inputFind.value}?api_key=${apiKey}`

		const response = await fetch(urlSumonner)
		const summonerData = await response.json()

		let puuID = summonerData.puuid
		summonerIcon.setAttribute(
			"src",
			`https://ddragon.leagueoflegends.com/cdn/13.14.1/img/profileicon/${summonerData.profileIconId}.png`
		)
		summonerName.textContent = summonerData.name
		summonerLevel.textContent = summonerData.summonerLevel

		const summonerID = summonerData.id

		const summonerInfo = `https://${apiRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerID}?api_key=${apiKey}`

		const responseInfo = await fetch(summonerInfo)
		const SummonerDataInfo = await responseInfo.json()

		summonerTier.textContent = ""
		summonerRank.textContent = ""
		summonerWR.textContent = ``

		SummonerDataInfo?.length ? true : (summonerTier.textContent = "UNRANKED")

		for (const summoner of SummonerDataInfo) {
			if (summoner.queueType === "RANKED_SOLO_5x5") {
				summonerTier.textContent = summoner.tier

				summonerRank.textContent = summoner.rank

				summonerWR.textContent = `WR: ${Math.floor(
					(summoner.wins / (summoner.losses + summoner.wins)) * 100
				)}%`
			} else {
			}
		}

		const lastMatches = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuID}/ids?start=0&count=5&api_key=${apiKey}`

		const responseLastMatches = await fetch(lastMatches)
		const lastMatchesData = await responseLastMatches.json()
		const lastMatechesArr = []
		const gameTime = []
		for (const match of lastMatchesData) {
			const urlMatch = `https://europe.api.riotgames.com/lol/match/v5/matches/${match}?api_key=${apiKey}`

			const responseMatch = await fetch(urlMatch)
			const matchData = await responseMatch.json()
			if (matchData.info.gameMode === "CLASSIC") {
				lastMatechesArr.push(matchData.info.participants)

				gameTime.push(matchData.info.gameDuration)
				console.log(matchData)
			}
		}

		let mainChamp = ""

		let position = ""
		let kill = ""
		let assist = ""
		let deaths = ""
		let championLevel = ""
		let items0 = ""
		let items1 = ""
		let items2 = " "
		let items3 = ""
		let items4 = ""
		let items5 = ""
		let items6 = ""
		let damageDeltToChampions = ""
		let minionKilled = ""
		let controlWard = ""
		let goldEard = ""
		let kda = ""
		let mainRune = ""
		let secondRunes = ""
		let gameTimeCount = 0
		let win = ""
		let summonerSpell1 = ""
		let summonerSpell2 = ""
		showHistoryBtn.addEventListener("click", () => {
			lastGames.innerHTML = ""
			wrrapperHistoryGames.style.height = "100%"
			hiddeHistroyGamesBtn.classList.remove("hidden")
			showHistoryBtn.classList.add("hidden")

			lastMatechesArr.forEach(match => {
				console.log(match)
				if (match[0]?.puuid === puuID) {
					let index = 0
					win = match[index].win
					mainRune = match[index].perks.styles[0].selections[0].perk
					secondRunes = match[index].perks.styles[1].style
					summonerSpell1 = match[index].summoner1Id
					summonerSpell2 = match[index].summoner2Id

					mainChamp = match[index].championName
					position = match[index].individualPosition
					kill = match[index].kills
					assist = match[index].assists
					deaths = match[index].deaths
					championLevel = match[index].champLevel

					damageDeltToChampions =
						match[index].trueDamageDealtToChampions +
						match[index].physicalDamageDealtToChampions +
						match[index].magicDamageDealtToChampions

					minionKilled =
						match[index].totalMinionsKilled + match[index].neutralMinionsKilled

					controlWard = match[index].visionWardsBoughtInGame

					items0 = match[index].item0
					items1 = match[index].item1
					items2 = match[index].item2
					items3 = match[index].item3
					items4 = match[index].item4
					items5 = match[index].item5
					items6 = match[index].item6
					goldEard = match[index].goldEarned
				}

				if (match[1]?.puuid === puuID) {
					let index = 1

					mainChamp = match[index].championName
					position = match[index].individualPosition
					kill = match[index].kills
					assist = match[index].assists
					deaths = match[index].deaths
					championLevel = match[index].champLevel
					items0 = match[index].item0
					items1 = match[index].item1
					items2 = match[index].item2
					items3 = match[index].item3
					items4 = match[index].item4
					items5 = match[index].item5
					items6 = match[index].item6
					damageDeltToChampions =
						match[index].trueDamageDealtToChampions +
						match[index].physicalDamageDealtToChampions +
						match[index].magicDamageDealtToChampions
					summonerSpell1 = match[index].summoner1Id
					summonerSpell2 = match[index].summoner2Id

					minionKilled =
						match[index].totalMinionsKilled + match[index].neutralMinionsKilled
					controlWard = match[index].visionWardsBoughtInGame
					goldEard = match[index].goldEarned
					mainRune = match[index].perks.styles[0].selections[0].perk
					secondRunes = match[index].perks.styles[1].style
					win = match[index].win
				}
				if (match[2]?.puuid === puuID) {
					let index = 2
					mainChamp = match[index].championName
					position = match[index].individualPosition
					kill = match[index].kills
					assist = match[index].assists
					deaths = match[index].deaths
					championLevel = match[index].champLevel
					items0 = match[index].item0
					items1 = match[index].item1
					items2 = match[index].item2
					items3 = match[index].item3
					items4 = match[index].item4
					items5 = match[index].item5
					items6 = match[index].item6
					damageDeltToChampions =
						match[index].trueDamageDealtToChampions +
						match[index].physicalDamageDealtToChampions +
						match[index].magicDamageDealtToChampions
					summonerSpell1 = match[index].summoner1Id
					summonerSpell2 = match[index].summoner2Id

					minionKilled =
						match[index].totalMinionsKilled + match[index].neutralMinionsKilled
					controlWard = match[index].visionWardsBoughtInGame
					goldEard = match[index].goldEarned
					mainRune = match[index].perks.styles[0].selections[0].perk
					secondRunes = match[index].perks.styles[1].style
					win = match[index].win
				}
				if (match[3]?.puuid === puuID) {
					let index = 3
					mainChamp = match[index].championName
					position = match[index].individualPosition
					kill = match[index].kills
					assist = match[index].assists
					deaths = match[index].deaths
					championLevel = match[index].champLevel
					items0 = match[index].item0
					items1 = match[index].item1
					items2 = match[index].item2
					items3 = match[index].item3
					items4 = match[index].item4
					items5 = match[index].item5
					items6 = match[index].item6
					damageDeltToChampions =
						match[index].trueDamageDealtToChampions +
						match[index].physicalDamageDealtToChampions +
						match[index].magicDamageDealtToChampions
					summonerSpell1 = match[index].summoner1Id
					summonerSpell2 = match[index].summoner2Id
					minionKilled =
						match[index].totalMinionsKilled + match[index].neutralMinionsKilled
					controlWard = match[index].visionWardsBoughtInGame
					goldEard = match[index].goldEarned
					mainRune = match[index].perks.styles[0].selections[0].perk
					secondRunes = match[index].perks.styles[1].style
					win = match[index].win
				}
				if (match[4]?.puuid === puuID) {
					let index = 4
					console.log(match[0].item0)
					mainChamp = match[index].championName
					position = match[index].individualPosition
					kill = match[index].kills
					assist = match[index].assists
					deaths = match[index].deaths
					championLevel = match[index].champLevel
					items0 = match[index].item0
					items1 = match[index].item1
					items2 = match[index].item2
					items3 = match[index].item3
					items4 = match[index].item4
					items5 = match[index].item5
					items6 = match[index].item6
					damageDeltToChampions =
						match[index].trueDamageDealtToChampions +
						match[index].physicalDamageDealtToChampions +
						match[index].magicDamageDealtToChampions
					summonerSpell1 = match[index].summoner1Id
					summonerSpell2 = match[index].summoner2Id
					minionKilled =
						match[index].totalMinionsKilled + match[index].neutralMinionsKilled
					controlWard = match[index].visionWardsBoughtInGame
					goldEard = match[index].goldEarned
					mainRune = match[index].perks.styles[0].selections[0].perk
					secondRunes = match[index].perks.styles[1].style
					win = match[index].win
				}
				if (match[5]?.puuid === puuID) {
					let index = 5

					mainChamp = match[index].championName
					position = match[index].individualPosition
					kill = match[index].kills
					assist = match[index].assists
					deaths = match[index].deaths
					championLevel = match[index].champLevel
					items0 = match[index].item0
					items1 = match[index].item1
					items2 = match[index].item2
					items3 = match[index].item3
					items4 = match[index].item4
					items5 = match[index].item5
					items6 = match[index].item6
					damageDeltToChampions =
						match[index].trueDamageDealtToChampions +
						match[index].physicalDamageDealtToChampions +
						match[index].magicDamageDealtToChampions
					summonerSpell1 = match[index].summoner1Id
					summonerSpell2 = match[index].summoner2Id
					minionKilled =
						match[index].totalMinionsKilled + match[index].neutralMinionsKilled
					controlWard = match[index].visionWardsBoughtInGame
					goldEard = match[index].goldEarned
					mainRune = match[index].perks.styles[0].selections[0].perk
					secondRunes = match[index].perks.styles[1].style
					win = match[index].win
				}
				if (match[6]?.puuid === puuID) {
					let index = 6
					mainChamp = match[index].championName
					position = match[index].individualPosition
					kill = match[index].kills
					assist = match[index].assists
					deaths = match[index].deaths
					championLevel = match[index].champLevel
					items0 = match[index].item0
					items1 = match[index].item1
					items2 = match[index].item2
					items3 = match[index].item3
					items4 = match[index].item4
					items5 = match[index].item5
					items6 = match[index].item6
					damageDeltToChampions =
						match[index].trueDamageDealtToChampions +
						match[index].physicalDamageDealtToChampions +
						match[index].magicDamageDealtToChampions
					summonerSpell1 = match[index].summoner1Id
					summonerSpell2 = match[index].summoner2Id
					minionKilled =
						match[index].totalMinionsKilled + match[index].neutralMinionsKilled
					controlWard = match[index].visionWardsBoughtInGame
					goldEard = match[index].goldEarned
					mainRune = match[index].perks.styles[0].selections[0].perk
					secondRunes = match[index].perks.styles[1].style
					win = match[index].win
				}
				if (match[7]?.puuid === puuID) {
					let index = 7
					mainChamp = match[index].championName
					position = match[index].individualPosition
					kill = match[index].kills
					assist = match[index].assists
					deaths = match[index].deaths
					championLevel = match[index].champLevel
					items0 = match[index].item0
					items1 = match[index].item1
					items2 = match[index].item2
					items3 = match[index].item3
					items4 = match[index].item4
					items5 = match[index].item5
					items6 = match[index].item6
					damageDeltToChampions =
						match[index].trueDamageDealtToChampions +
						match[index].physicalDamageDealtToChampions +
						match[index].magicDamageDealtToChampions
					summonerSpell1 = match[index].summoner1Id
					summonerSpell2 = match[index].summoner2Id
					minionKilled =
						match[index].totalMinionsKilled + match[index].neutralMinionsKilled
					controlWard = match[index].visionWardsBoughtInGame
					goldEard = match[index].goldEarned
					mainRune = match[index].perks.styles[0].selections[0].perk
					secondRunes = match[index].perks.styles[1].style
					win = match[index].win
				}
				if (match[8]?.puuid === puuID) {
					let index = 8
					mainChamp = match[index].championName
					position = match[index].individualPosition
					kill = match[index].kills
					assist = match[index].assists
					deaths = match[index].deaths
					championLevel = match[index].champLevel
					items0 = match[index].item0
					items1 = match[index].item1
					items2 = match[index].item2
					items3 = match[index].item3
					items4 = match[index].item4
					items5 = match[index].item5
					items6 = match[index].item6
					damageDeltToChampions =
						match[index].trueDamageDealtToChampions +
						match[index].physicalDamageDealtToChampions +
						match[index].magicDamageDealtToChampions
					summonerSpell1 = match[index].summoner1Id
					summonerSpell2 = match[index].summoner2Id
					minionKilled =
						match[index].totalMinionsKilled + match[index].neutralMinionsKilled
					controlWard = match[index].visionWardsBoughtInGame
					goldEard = match[index].goldEarned
					mainRune = match[index].perks.styles[0].selections[0].perk
					secondRunes = match[index].perks.styles[1].style
					win = match[index].win
				}
				if (match[9]?.puuid === puuID) {
					let index = 9
					mainChamp = match[index].championName
					position = match[index].individualPosition
					kill = match[index].kills
					assist = match[index].assists
					deaths = match[index].deaths
					championLevel = match[index].champLevel
					items0 = match[index].item0
					items1 = match[index].item1
					items2 = match[index].item2
					items3 = match[index].item3
					items4 = match[index].item4
					items5 = match[index].item5
					items6 = match[index].item6
					damageDeltToChampions =
						match[index].trueDamageDealtToChampions +
						match[index].physicalDamageDealtToChampions +
						match[index].magicDamageDealtToChampions
					summonerSpell1 = match[index].summoner1Id
					summonerSpell2 = match[index].summoner2Id
					minionKilled =
						match[index].totalMinionsKilled + match[index].neutralMinionsKilled
					controlWard = match[index].visionWardsBoughtInGame
					goldEard = match[index].goldEarned
					mainRune = match[index].perks.styles[0].selections[0].perk
					secondRunes = match[index].perks.styles[1].style
					win = match[index].win
				}
				if (summonerSpell1 === 21) summonerSpell1 = "abilities/SummonerBarrier.png"
				if (summonerSpell1 === 1) summonerSpell1 = "abilities/SummonerBoost.png"
				if (summonerSpell1 === 3) summonerSpell1 = "abilities/SummonerExhaust.png"
				if (summonerSpell1 === 14) summonerSpell1 = "abilities/SummonerDot.png"
				if (summonerSpell1 === 4) summonerSpell1 = "abilities/SummonerFlash.png"
				if (summonerSpell1 === 6) summonerSpell1 = "abilities/SummonerHaste.png"
				if (summonerSpell1 === 7) summonerSpell1 = "abilities/SummonerHeal.png"
				if (summonerSpell1 === 11) summonerSpell1 = "abilities/SummonerSmite.png"
				if (summonerSpell1 === 12) summonerSpell1 = "abilities/SummonerTeleport.png"

				if (summonerSpell2 === 21) summonerSpell2 = "abilities/SummonerBarrier.png"
				if (summonerSpell2 === 1) summonerSpell2 = "abilities/SummonerBoost.png"
				if (summonerSpell2 === 3) summonerSpell2 = "abilities/SummonerExhaust.png"
				if (summonerSpell2 === 14) summonerSpell2 = "abilities/SummonerDot.png"
				if (summonerSpell2 === 4) summonerSpell2 = "abilities/SummonerFlash.png"
				if (summonerSpell2 === 6) summonerSpell2 = "abilities/SummonerHaste.png"
				if (summonerSpell2 === 7) summonerSpell2 = "abilities/SummonerHeal.png"
				if (summonerSpell2 === 11) summonerSpell2 = "abilities/SummonerSmite.png"
				if (summonerSpell2 === 12) summonerSpell2 = "abilities/SummonerTeleport.png"

				if (win) win = "Victory"
				else win = "Defeat"
				if (mainRune === 8112)
					mainRune = "perk-images/Styles/Domination/Electrocute/Electrocute.png"
				if (mainRune === 8124)
					mainRune = "perk-images/Styles/Domination/Predator/Predator.png"
				if (mainRune === 8128)
					mainRune = "perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png"
				if (mainRune === 9923)
					mainRune = "perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png"

				if (mainRune === 8351)
					mainRune =
						"perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png"
				if (mainRune === 8360)
					mainRune =
						"perk-images/Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png"
				if (mainRune === 8369)
					mainRune = "perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png"

				if (mainRune === 8005)
					mainRune = "perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png"
				if (mainRune === 8008)
					mainRune = "perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png"
				if (mainRune === 8021)
					mainRune = "perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png"
				if (mainRune === 8010)
					mainRune = "perk-images/Styles/Precision/Conqueror/Conqueror.png"

				if (mainRune === 8437)
					mainRune =
						"perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png"
				if (mainRune === 8439)
					mainRune =
						"perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png"
				if (mainRune === 8465)
					mainRune = "perk-images/Styles/Resolve/Guardian/Guardian.png"

				if (mainRune === 8214)
					mainRune = "perk-images/Styles/Sorcery/SummonAery/SummonAery.png"
				if (mainRune === 8229)
					mainRune = "perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png"
				if (mainRune === 8230)
					mainRune = "perk-images/Styles/Sorcery/PhaseRush/PhaseRush.png"

				if (secondRunes === 8100)
					secondRunes = `perk-images/Styles/7200_Domination.png`
				if (secondRunes === 8300) secondRunes = `perk-images/Styles/7203_Whimsy.png`
				if (secondRunes === 8000)
					secondRunes = `perk-images/Styles/7201_Precision.png`
				if (secondRunes === 8400)
					secondRunes = `perk-images/Styles/7204_Resolve.png`
				if (secondRunes === 8200)
					secondRunes = `perk-images/Styles/7202_Sorcery.png`

				const divGame = document.createElement("div")
				divGame.classList.add("game")
				const typeGame = document.createElement("div")
				typeGame.classList.add("type-game")
				const infoAboutGame = document.createElement("div")
				infoAboutGame.classList.add("info-aobut-game")
				const gameMode = document.createElement("h5")
				gameMode.classList.add("font")
				gameMode.textContent = "Rankingowa solo-duo"
				const gameRole = document.createElement("p")

				gameRole.textContent = position
				if (gameRole.textContent === "UTILITY") gameRole.textContent = "SUPPORT"
				const gameStatus = document.createElement("div")
				gameStatus.classList.add(".game-status")
				const winOrNot = document.createElement("p")
				if (win === "Victory") divGame.classList.add("win")
				else divGame.classList.add("los")

				winOrNot.textContent = win
				const gameTime1 = document.createElement("p")
				gameTime1.textContent = `Game time:   ${Math.floor(
					gameTime[gameTimeCount] / 60
				)} ${gameTime[gameTimeCount] % 60}s`
				gameTimeCount++
				const divYourChamp = document.createElement("div")
				divYourChamp.classList.add("your-champ")
				const champ = document.createElement("div")
				champ.classList.add("champ")
				const imgChamp = document.createElement("img")
				imgChamp.classList.add("champ-icon")
				imgChamp.setAttribute("src", `tiles/${mainChamp}_0.jpg`)
				const runesSums = document.createElement("div")
				runesSums.classList.add("runes-summs")
				const sums = document.createElement("div")
				sums.classList.add("summoner-spels")
				const imgSum1 = document.createElement("img")
				imgSum1.setAttribute("src", summonerSpell1)
				const imgSum2 = document.createElement("img")
				imgSum2.setAttribute("src", summonerSpell2)
				const runes = document.createElement("div")
				runes.classList.add("runes")
				const rune1 = document.createElement("img")
				rune1.setAttribute("src", mainRune)
				const rune2 = document.createElement("img")
				rune2.setAttribute("src", secondRunes)
				rune2.classList.add("second-rune")
				const level = document.createElement("div")
				level.classList.add("level")

				const levelStatus = document.createElement("p")
				levelStatus.textContent = championLevel

				const stats = document.createElement("div")
				stats.classList.add("stats")
				const statsInfo = document.createElement("h4")
				const kda = document.createElement("p")
				statsInfo.textContent = `${kill}/${deaths}/${assist}`
				let kdaStatus = (kill + assist) / deaths
				kda.textContent = `${kdaStatus.toFixed(2)}:1 KDA`

				const champItems = document.createElement("div")
				champItems.classList.add("champ-items")

				const item0 = document.createElement("img")

				item0.setAttribute("src", `item/${items0}.png`)
				const item1 = document.createElement("img")
				item1.setAttribute("src", `item/${items1}.png`)
				const item2 = document.createElement("img")
				item2.setAttribute("src", `item/${items2}.png`)
				const item3 = document.createElement("img")
				item3.setAttribute("src", `item/${items3}.png`)
				const item4 = document.createElement("img")
				item4.setAttribute("src", `item/${items4}.png`)

				const item5 = document.createElement("img")
				item5.setAttribute("src", `item/${items5}.png`)
				const item6 = document.createElement("img")
				item6.setAttribute("src", `item/${items6}.png`)

				const yourStats = document.createElement("div")
				yourStats.classList.add("your-stats")
				const stat1 = document.createElement("p")
				stat1.textContent = `DMG: ${damageDeltToChampions}`
				const stat2 = document.createElement("p")
				stat2.textContent = `Control Ward ${controlWard}`
				const stat3 = document.createElement("p")
				stat3.textContent = `CS: ${minionKilled}`
				const stat4 = document.createElement("p")
				stat4.textContent = `Gold: ${goldEard}`

				const allParticipants = document.createElement("div")
				allParticipants.classList.add("all-participants")
				const team1 = document.createElement("div")
				team1.classList.add("team1")

				const divTop = document.createElement("div")

				const iconTop = document.createElement("img")
				iconTop.setAttribute("src", `tiles/${match[0].championName}_0.jpg`)

				const nameTop = document.createElement("p")
				nameTop.textContent = match[0].summonerName

				const divJungle = document.createElement("div")

				const iconJungle = document.createElement("img")
				iconJungle.setAttribute("src", `tiles/${match[1].championName}_0.jpg`)
				const nameJungle = document.createElement("p")
				nameJungle.textContent = match[1].summonerName

				const divMid = document.createElement("div")

				const iconMid = document.createElement("img")
				iconMid.setAttribute("src", `tiles/${match[2].championName}_0.jpg`)
				const nameMid = document.createElement("p")
				nameMid.textContent = match[2].summonerName

				const divAdc = document.createElement("div")

				const iconAdc = document.createElement("img")
				iconAdc.setAttribute("src", `tiles/${match[3].championName}_0.jpg`)
				const nameAdc = document.createElement("p")
				nameAdc.textContent = match[3].summonerName

				const divSupport = document.createElement("div")

				const iconSupport = document.createElement("img")
				iconSupport.setAttribute("src", `tiles/${match[4].championName}_0.jpg`)
				const nameSupport = document.createElement("p")
				nameSupport.textContent = match[4].summonerName

				const team2 = document.createElement("div")
				team2.classList.add("team2")

				const divTop2 = document.createElement("div")

				const iconTop2 = document.createElement("img")
				iconTop2.setAttribute("src", `tiles/${match[5].championName}_0.jpg`)
				const nameTop2 = document.createElement("p")
				nameTop2.textContent = match[5].summonerName

				const divJungle2 = document.createElement("div")

				const iconJungle2 = document.createElement("img")
				iconJungle2.setAttribute("src", `tiles/${match[6].championName}_0.jpg`)
				const nameJungle2 = document.createElement("p")
				nameJungle2.textContent = match[6].summonerName

				const divMid2 = document.createElement("div")

				const iconMid2 = document.createElement("img")
				iconMid2.setAttribute("src", `tiles/${match[7].championName}_0.jpg`)
				const nameMid2 = document.createElement("p")
				nameMid2.textContent = match[7].summonerName

				const divAdc2 = document.createElement("div")
				console.log(match[8])
				const iconAdc2 = document.createElement("img")
				iconAdc2.setAttribute("src", `tiles/${match[8].championName}_0.jpg`)
				const nameAdc2 = document.createElement("p")
				nameAdc2.textContent = match[8].summonerName

				const divSupport2 = document.createElement("div")

				const iconSupport2 = document.createElement("img")
				iconSupport2.setAttribute("src", `tiles/${match[9].championName}_0.jpg`)
				const nameSupport2 = document.createElement("p")
				nameSupport2.textContent = match[9].summonerName

				lastGames.appendChild(divGame)
				lastGames.appendChild(divYourChamp)

				//DIVGAME
				divGame.appendChild(typeGame)
				divGame.appendChild(divYourChamp)
				divGame.appendChild(yourStats)
				divGame.appendChild(allParticipants)

				typeGame.appendChild(infoAboutGame)
				typeGame.appendChild(gameStatus)

				divYourChamp.appendChild(champ)
				divYourChamp.appendChild(champItems)

				yourStats.appendChild(stat1)
				yourStats.appendChild(stat2)
				yourStats.appendChild(stat3)
				yourStats.appendChild(stat4)

				allParticipants.appendChild(team1)
				allParticipants.appendChild(team2)

				infoAboutGame.appendChild(gameMode)
				infoAboutGame.appendChild(gameRole)

				level.appendChild(levelStatus)

				gameStatus.appendChild(winOrNot)
				gameStatus.appendChild(gameTime1)

				divYourChamp.appendChild(champ)
				divYourChamp.appendChild(champItems)

				champ.appendChild(imgChamp)
				champ.appendChild(imgChamp)
				champ.appendChild(runesSums)
				champ.appendChild(level)
				champ.appendChild(stats)

				runesSums.appendChild(sums)
				runesSums.appendChild(runes)

				sums.appendChild(imgSum1)
				sums.appendChild(imgSum2)

				runes.appendChild(rune1)
				runes.appendChild(rune2)

				stats.appendChild(statsInfo)
				stats.appendChild(kda)

				team1.append(divTop)

				divTop.appendChild(iconTop)
				divTop.appendChild(nameTop)

				team1.append(divJungle)

				divJungle.appendChild(iconJungle)
				divJungle.appendChild(nameJungle)

				team1.append(divMid)

				divMid.appendChild(iconMid)
				divMid.appendChild(nameMid)

				team1.append(divAdc)

				divAdc.appendChild(iconAdc)
				divAdc.appendChild(nameAdc)

				team1.append(divSupport)

				divSupport.appendChild(iconSupport)
				divSupport.appendChild(nameSupport)

				team2.append(divTop2)

				divTop2.appendChild(iconTop2)
				divTop2.appendChild(nameTop2)

				team2.append(divJungle2)

				divJungle2.appendChild(iconJungle2)
				divJungle2.appendChild(nameJungle2)

				team2.append(divMid2)

				divMid2.appendChild(iconMid2)
				divMid2.appendChild(nameMid2)

				team2.append(divAdc2)

				divAdc2.appendChild(iconAdc2)
				divAdc2.appendChild(nameAdc2)

				team2.append(divSupport2)

				divSupport2.appendChild(iconSupport2)
				divSupport2.appendChild(nameSupport2)

				if (items0 === 0) {
					item0.setAttribute("src", "item/7050.png")

					champItems.appendChild(item0)
				}
				if (items1 === 0) {
					item1.setAttribute("src", "item/7050.png")

					champItems.appendChild(item1)
				}
				if (items2 === 0) {
					item2.setAttribute("src", "item/7050.png")

					champItems.appendChild(item2)
				}
				if (items3 === 0) {
					item3.setAttribute("src", "item/7050.png")

					champItems.appendChild(item3)
				}
				if (items4 === 0) {
					item4.setAttribute("src", "item/7050.png")

					champItems.appendChild(item4)
				}
				if (items5 === 0) {
					item5.setAttribute("src", "item/7050.png")

					champItems.appendChild(item5)
				}
				if (items6 === 0) {
					item6.setAttribute("src", "item/7050.png")

					champItems.appendChild(item6)
				}
				champItems.appendChild(item0)
				champItems.appendChild(item1)
				champItems.appendChild(item2)
				champItems.appendChild(item3)
				champItems.appendChild(item4)

				champItems.appendChild(item5)

				champItems.appendChild(item6)
			})
		})
		hiddeHistroyGamesBtn.addEventListener("click", () => {
			wrrapperHistoryGames.style.height = "100vh"

			hiddeHistroyGamesBtn.classList.add("hidden")
			showHistoryBtn.classList.remove("hidden")

			lastGames.innerHTML = ""
			window.scrollTo(2000, 1800)
		})

		const matchOne = lastMatechesArr[0]

		errorInfo.classList.add("hidden")
	} catch (error) {
		summonerInfoDiv.classList.add("hidden")
		console.log(error)
		historyGame.classList.add("hidden")
		errorInfo.classList.remove("hidden")
	}
}

regions.forEach(region => {
	region.addEventListener("click", () => {
		console.log(event.target.textContent)
		regionName = event.target.textContent
		selectedRegion.textContent = regionName
		popUpRegions.classList.add("hidden")
		expand.classList.remove("hidden")
		roll.classList.add("hidden")
		return regionName
	})
})

const team = arr => {
	const top = arr[0]
	const jungle = arr[1]
	const mid = arr[2]
	const adc = arr[3]
	const support = arr[4]
}

expand.addEventListener("click", () => {
	popUpRegions.classList.remove("hidden")
	expand.classList.add("hidden")
	roll.classList.remove("hidden")
})
roll.addEventListener("click", () => {
	popUpRegions.classList.add("hidden")
	expand.classList.remove("hidden")
	roll.classList.add("hidden")
})

searchIcon.addEventListener("click", findSummoner)
