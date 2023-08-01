const myIcon = document.querySelector(".my-icon")
const mySummonerName = document.querySelector(".my-summoner-name")
const myLevel = document.querySelector(".my-level")

const rightArrow = document.querySelector(".fa-arrow-right")
const leftArrow = document.querySelector(".fa-arrow-left")
const champName = document.querySelector(".champ-name")
const champTitle = document.querySelector(".title-champ")
const champImg = document.querySelector(".img-champ")
const champLore = document.querySelector(".lore-text")
const champLoreLink = document.querySelector(".link")
const champAbilities = document.querySelector(".abilities")
const passive = document.querySelector(".passive")
const abilityQ = document.querySelector(".q")
const abilityW = document.querySelector(".w")
const abilityE = document.querySelector(".e")
const abilityR = document.querySelector(".r")
const passiveImg = document.querySelector(".passive-img")
const abilityQImg = document.querySelector(".q-img")
const abilityWImg = document.querySelector(".e-img")
const abilityEImg = document.querySelector(".w-img")
const abilityRImg = document.querySelector(".r-img")
const closeAbilites = document.querySelector(".close-abilities")
const allChamiponsJson =
	"https://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/champion.json"

const loreEkko = `

Born with genius-level intellect, Ekko constructed simple machines before he could crawl. His parents, Inna and Wyeth, vowed to provide a good future for their son—Zaun, with all its pollution and crime, would only stifle Ekko, whom they felt deserved the wealth and opportunities of Piltover. Throughout his youth he watched his parents age beyond their years, toiling for too many hours under dangerous conditions in suffocating factories. `
const loreSylas = `As a mage born to a poor Demacian family, Sylas of Dregbourne was perhaps doomed from the start. Despite their low social standing, his parents were firm believers in their country’s ideals. So, when they discovered their son was “afflicted” with magical abilities, they convinced him to turn himself in to the kingdom’s mageseekers.`
const myTier = document.querySelector(".my-tier")
const myRank = document.querySelector(".my-rank")
const wR = document.querySelector(".wr")
const myProfileData = async function () {
	try {
		const urlFavChamps = `https://eun1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/__khWeNZm14SYyRcSjOOOr4HVxx-qK9Fjr7L__eL1YoWwRU?api_key=${apiKey}`
		const responseFavChamp = await fetch(urlFavChamps)
		const favChampsData = await responseFavChamp.json()
		const topThreeChamps = favChampsData.slice(0, 3)
		const topThreeChampsArr = []

		const url = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-name/michuMF?api_key=${apiKey}`
		const urlMyWinRate = `https://eun1.api.riotgames.com/lol/league/v4/entries/by-summoner/__khWeNZm14SYyRcSjOOOr4HVxx-qK9Fjr7L__eL1YoWwRU?api_key=${apiKey}`
		const allChamipons = allChamiponsJson

		const responseWR = await fetch(urlMyWinRate)
		const dataWR = await responseWR.json()

		const responseAllChampion = await fetch(allChamipons)
		const allDataChamp = await responseAllChampion.json()
		const responseMyData = await fetch(url)
		const myData = await responseMyData.json()

		for (const [key, champion] of Object.entries(allDataChamp.data)) {
			if (
				champion.key == topThreeChamps[0].championId ||
				champion.key == topThreeChamps[1].championId ||
				champion.key == topThreeChamps[2].championId
			) {
				topThreeChampsArr.push(champion.id)
			}
		}
		const favChampDataArr = []
		for (const champ of topThreeChampsArr) {
			const urlfavChamp = `https://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/champion/${champ}.json`
			const responseChamp = await fetch(urlfavChamp)
			const favChampData = await responseChamp.json()

			favChampDataArr.push(favChampData.data)
		}

		const { Akali } = favChampDataArr[0]
		const { Ekko } = favChampDataArr[1]
		const { Sylas } = favChampDataArr[2]

		let index = 0

		rightArrow.addEventListener("click", () => {
			if (index === 0) {
				leftArrow.style.display = "none"
				rightArrow.style.display = "right"
				champName.textContent = Akali.name
				champTitle.textContent = Akali.title
				champImg.setAttribute(
					"src",
					"https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Akali_0.jpg"
				)
				champLoreLink.setAttribute(
					"href",
					"https://universe.leagueoflegends.com/en_gb/champion/akali"
				)

				passiveImg.setAttribute("src", "passives/Akali_P.png")
				abilityQImg.setAttribute("src", "abilities/AkaliQ.png")
				abilityWImg.setAttribute("src", "abilities/AkaliW.png")
				abilityEImg.setAttribute("src", "abilities/AkaliE.png")
				abilityRImg.setAttribute("src", "abilities/AkaliR.png")

				passive.textContent = Akali.passive.name
				abilityQ.textContent = Akali.spells[0].name
				abilityW.textContent = Akali.spells[1].name
				abilityE.textContent = Akali.spells[2].name
				abilityR.textContent = Akali.spells[3].name
			} else {
			}
			index = index + 1
			if (index === 1) {
				leftArrow.style.display = "block"
				champName.textContent = Ekko.name
				champTitle.textContent = Ekko.title
				champImg.setAttribute(
					"src",
					"https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Ekko_0.jpg"
				)
				champLoreLink.setAttribute(
					"href",
					"https://universe.leagueoflegends.com/en_gb/champion/ekko"
				)
				passiveImg.setAttribute("src", "passives/Ekko_P.png")
				abilityQImg.setAttribute("src", "abilities/EkkoQ.png")
				abilityWImg.setAttribute("src", "abilities/EkkoW.png")
				abilityEImg.setAttribute("src", "abilities/EkkoE.png")
				abilityRImg.setAttribute("src", "abilities/EkkoR.png")

				passive.textContent = Ekko.passive.name
				abilityQ.textContent = Ekko.spells[0].name
				abilityW.textContent = Ekko.spells[1].name
				abilityE.textContent = Ekko.spells[2].name
				abilityR.textContent = Ekko.spells[3].name
				champLore.textContent = loreEkko
			} else if (index === 2) {
				rightArrow.style.display = "none"
				champName.textContent = Sylas.name
				champTitle.textContent = Sylas.title
				champImg.setAttribute(
					"src",
					"https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Sylas_0.jpg"
				)
				champLoreLink.setAttribute(
					"href",
					"https://universe.leagueoflegends.com/en_gb/champion/sylas"
				)
				passiveImg.setAttribute("src", "passives/SylasP.png")
				abilityQImg.setAttribute("src", "abilities/SylasQ.png")
				abilityWImg.setAttribute("src", "abilities/SylasW.png")
				abilityEImg.setAttribute("src", "abilities/SylasE.png")
				abilityRImg.setAttribute("src", "abilities/SylasR.png")

				passive.textContent = Sylas.passive.name
				abilityQ.textContent = Sylas.spells[0].name
				abilityW.textContent = Sylas.spells[1].name
				abilityE.textContent = Sylas.spells[2].name
				abilityR.textContent = Sylas.spells[3].name
				champLore.textContent = loreSylas
			}
		})
		leftArrow.addEventListener("click", () => {
			index = index - 1
			if (index === 0) {
				leftArrow.style.display = "none"
				rightArrow.style.display = "block"
				champName.textContent = Akali.name
				champTitle.textContent = Akali.title
				champImg.setAttribute(
					"src",
					"https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Akali_0.jpg"
				)
				champLoreLink.setAttribute(
					"href",
					"https://universe.leagueoflegends.com/en_gb/champion/akali"
				)
				passiveImg.setAttribute("src", "passives/Akali_P.png")
				abilityQImg.setAttribute("src", "abilities/AkaliQ.png")
				abilityWImg.setAttribute("src", "abilities/AkaliW.png")
				abilityEImg.setAttribute("src", "abilities/AkaliE.png")
				abilityRImg.setAttribute("src", "abilities/AkaliR.png")

				passive.textContent = Akali.passive.name
				abilityQ.textContent = Akali.spells[0].name
				abilityW.textContent = Akali.spells[1].name
				abilityE.textContent = Akali.spells[2].name
				abilityR.textContent = Akali.spells[3].name
			} else {
			}
			if (index === 1) {
				leftArrow.style.display = "block"
				champName.textContent = Ekko.name
				champTitle.textContent = Ekko.title
				champImg.setAttribute(
					"src",
					"https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Ekko_0.jpg"
				)
				champLoreLink.setAttribute(
					"href",
					"https://universe.leagueoflegends.com/en_gb/champion/ekko"
				)
				passiveImg.setAttribute("src", "passives/Ekko_P.png")
				abilityQImg.setAttribute("src", "abilities/EkkoQ.png")
				abilityWImg.setAttribute("src", "abilities/EkkoW.png")
				abilityEImg.setAttribute("src", "abilities/EkkoE.png")
				abilityRImg.setAttribute("src", "abilities/EkkoR.png")

				passive.textContent = Ekko.passive.name
				abilityQ.textContent = Ekko.spells[0].name
				abilityW.textContent = Ekko.spells[1].name
				abilityE.textContent = Ekko.spells[2].name
				abilityR.textContent = Ekko.spells[3].name
				champLore.textContent = loreEkko
			} else if (index === 2) {
				rightArrow.style.display = "none"
				champName.textContent = Sylas.name
				champTitle.textContent = Sylas.title
				champImg.setAttribute(
					"src",
					"https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Sylas_0.jpg"
				)
				champLoreLink.setAttribute(
					"href",
					"https://universe.leagueoflegends.com/en_gb/champion/sylas"
				)
				passiveImg.setAttribute("src", "passives/SylasP.png")
				abilityQImg.setAttribute("src", "abilities/SylasQ.png")
				abilityWImg.setAttribute("src", "abilities/SylasW.png")
				abilityEImg.setAttribute("src", "abilities/SylasE.png")
				abilityRImg.setAttribute("src", "abilities/SylasR.png")

				champLore.textContent = loreSylas
				passive.textContent = Sylas.passive.name
				abilityQ.textContent = Sylas.spells[0].name
				abilityW.textContent = Sylas.spells[1].name
				abilityE.textContent = Sylas.spells[2].name
				abilityR.textContent = Sylas.spells[3].name
			}
		})
		if (index === 0) {
			leftArrow.style.display = "none"
			champName.textContent = Akali.name
			champTitle.textContent = Akali.title
			champImg.setAttribute(
				"src",
				"https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Akali_0.jpg"
			)
			champLoreLink.setAttribute(
				"href",
				"https://universe.leagueoflegends.com/en_gb/champion/akali"
			)

			passiveImg.setAttribute("src", "passives/Akali_P.png")
			abilityQImg.setAttribute("src", "abilities/AkaliQ.png")
			abilityWImg.setAttribute("src", "abilities/AkaliW.png")
			abilityEImg.setAttribute("src", "abilities/AkaliE.png")
			abilityRImg.setAttribute("src", "abilities/AkaliR.png")

			passive.textContent = Akali.passive.name
			abilityQ.textContent = Akali.spells[0].name
			abilityW.textContent = Akali.spells[1].name
			abilityE.textContent = Akali.spells[2].name
			abilityR.textContent = Akali.spells[3].name
		} else {
		}

		closeAbilites.addEventListener("click", () => {
			champAbilities.classList.remove("not-hidden")
		})

		champImg.addEventListener("click", () => {
			champAbilities.classList.add("not-hidden")
		})

		setMyData(myIcon, myData.profileIconId, myLevel, myData.summonerLevel)
		setMyName(
			mySummonerName,
			myData.name,
			dataWR[0].tier,
			dataWR[0].rank,
			dataWR[0].wins,
			dataWR[0].losses
		)
	} catch (error) {}
}

const setMyData = (icon, idIcon, p, level) => {
	icon.setAttribute(
		"src",
		`https://ddragon.leagueoflegends.com/cdn/13.14.1/img/profileicon/${idIcon}.png
  `
	)

	p.textContent = `Level: ${level}`
}
const setMyName = (h1, mySummonerN, tier, rank, win, los) => {
	h1.textContent = mySummonerN
	myTier.textContent = tier
	myRank.textContent = rank
	wR.textContent = `WR: ${Math.floor((win / (los + win)) * 100)}%`
}

myProfileData()
