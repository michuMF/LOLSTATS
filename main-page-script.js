const classIcon = document.querySelectorAll(".icon-class")
const classText = document.querySelectorAll(".class")
const classHeadline = document.querySelector(".class-headline")
const imgClass = document.querySelector(".img-class")
const popUpClass = document.querySelector(".pop-up-class-info")
const shadow = document.querySelector(".shadow")
const closePopUp = document.querySelector(".close-popup")
const popUpHeader = document.querySelector(".class-header")
const showAllClassChampion = document.querySelector(".show-all-class-champion")
const hideAllClassChampion = document.querySelector(".hide-all-class-champion")
const infoClass = document.querySelector(".info-class")
const classImgIconShowAll = document.querySelector(".class-img-icon")
const classAssinsIcon = document.querySelector(".class-img-icon")

const infoAssasins = ` Assassins are a class of champions in League of Legends that specialize in killing or disabling high-value
targets. They are typically squishy and have high mobility, allowing them to quickly reach their targets and
eliminate them before they can react. Assassins are most effective in solo queue, where they can focus on
picking off enemy champions one at a time.`
const infoWarriors = `Warriors are champions who are a mix of tanks and damage dealers. They are typically tanky 
	champions with high damage output. Warriors: Warriors are similar to tanks, but they are a bit more versatile. Warriors can still absorb damage, but they also have more damage output than tanks. This makes them more well-rounded champions who can be played in a variety of roles.`
const infoMages =
	"Mages are champions who deal magic damage from a distance. They are typically squishy champions with high damage output. Mages are the primary source of magic damage on a team. They deal high damage from a distance, but they are also very squishy. Mages are often the target of assassins and other high-damage champions, so they need to be careful positioning themselves in team fights."
const infoMarksman =
	"Marksmen are champions who deal physical damage from a distance. They are typically squishy champions with high attack damage and attack speed.Marksmen: Marksmen are the main source of physical damage on a team. They deal high damage from a distance, but they are also very squishy. Marksmen need to be protected by their teammates in order to be effective."
const infoSupports = `
	upport  is to provide their team with utility, such as healing, shielding, and crowd control. Supports are typically squishy champions with low damage output, but their utility can make a huge difference in team fights. Supports are a vital part of any team, and they can make a big difference in the outcome of a game. `
const infoTanks =
	"Tanks are champions who are designed to absorb damage and protect their teammates. They are typically tanky champions with high health and armorTanks are the backbone of any team. They are responsible for absorbing damage and protecting their teammates from harm. Tanks are typically the front line in team fights, and they are often the first to die. However, their sacrifice allows their teammates to survive and deal damage"
let arrOfAssasins = []
const arrOfFighters = []
const arrOfMages = []
const arrOfMarksman = []
const arrOfSupports = []
const arrOfTanks = []
const getIconClass = async function () {
	try {
		const allChampions = `https://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/champion.json`
		const responseAllChapions = await fetch(allChampions)
		const allChampionsData = await responseAllChapions.json()

		for (const [key, champion] of Object.entries(allChampionsData.data)) {
			if (champion.tags[0] === "Assassin" || champion.tags[1] === "Assassin") {
				arrOfAssasins.push(champion.id)
			}
			if (champion.tags[0] === "Fighter" || champion.tags[1] === "Fighter") {
				arrOfFighters.push(champion.id)
			}
			if (champion.tags[0] === "Mage" || champion.tags[1] === "Mage") {
				arrOfMages.push(champion.id)
			}
			if (champion.tags[0] === "Marksman" || champion.tags[1] === "Marksman") {
				arrOfMarksman.push(champion.id)
			}
			if (champion.tags[0] === "Support" || champion.tags[1] === "Support") {
				arrOfSupports.push(champion.id)
			}
			if (champion.tags[0] === "Tank" || champion.tags[1] === "Tank") {
				arrOfTanks.push(champion.id)
			}
		}

		classIcon.forEach(icon => {
			icon.addEventListener("mouseover", () => {
				console.log()
				switch (icon.alt) {
					case "Assassins":
						imgClass.setAttribute(
							"src",
							` https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Akali_0.jpg`
						)

						classHeadline.textContent = "Assasins"
						infoClass.textContent = infoAssasins
						break
					case "Warriors":
						imgClass.setAttribute(
							"src",
							` https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg`
						)
						classHeadline.textContent = "Fighters"
						infoClass.textContent = infoWarriors
						break
					case "Mages":
						imgClass.setAttribute(
							"src",
							` https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Azir_0.jpg`
						)
						classHeadline.textContent = "Mages"
						infoClass.textContent = infoMages
						break
					case "Marksman":
						imgClass.setAttribute(
							"src",
							` https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ashe_0.jpg`
						)
						classHeadline.textContent = "Marksmen"
						infoClass.textContent = infoMarksman
						break
					case "Supports":
						imgClass.setAttribute(
							"src",
							` https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Soraka_0.jpg`
						)
						classHeadline.textContent = "Supports"
						infoClass.textContent = infoSupports
						break
					case "Tanks":
						imgClass.setAttribute(
							"src",
							` https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Braum_0.jpg`
						)
						classHeadline.textContent = "Tanks"
						infoClass.textContent = infoTanks
						break

					default:
				}
			})
		})

		classIcon.forEach(icon => {
			icon.addEventListener("click", () => {
				popUpClass.style.display = "block"
				shadow.style.display = "block"
				popUpHeader.innerText = icon.alt
				classImgIconShowAll.style.overflowY = "hidden"
				classImgIconShowAll.style.height = "12vh"
				hideAllClassChampion.style.display = "none"
				showAllClassChampion.style.display = "block"

				switch (icon.alt) {
					case "Assassins":
						infoClass.textContent = infoAssasins

						arrOfAssasins.forEach(assasin => {
							const imgAssasinIcon = document.createElement("img")
							const linkToLore = document.createElement("a")
							linkToLore.setAttribute(
								"href",
								`https://universe.leagueoflegends.com/pl_PL/story/champion/${assasin}/`
							)
							linkToLore.setAttribute("target", "blank")

							imgAssasinIcon.setAttribute(
								"src",
								`https://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${assasin}.png`
							)

							classAssinsIcon.appendChild(linkToLore)
							linkToLore.appendChild(imgAssasinIcon)
						})

						break
					case "Warriors":
						arrOfFighters.forEach(fighter => {
							const imgFighter = document.createElement("img")
							const linkToLore = document.createElement("a")
							linkToLore.setAttribute(
								"href",
								`https://universe.leagueoflegends.com/pl_PL/story/champion/${fighter}/`
							)
							linkToLore.setAttribute("target", "blank")

							imgFighter.setAttribute(
								"src",
								`https://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${fighter}.png`
							)
							classAssinsIcon.appendChild(linkToLore)
							linkToLore.appendChild(imgFighter)
						})
						classHeadline.textContent = "Fighters"

						break
					case "Mages":
						arrOfMages.forEach(mage => {
							const imgMageIcon = document.createElement("img")
							const linkToLore = document.createElement("a")
							linkToLore.setAttribute(
								"href",
								`https://universe.leagueoflegends.com/pl_PL/story/champion/${mage}/`
							)
							linkToLore.setAttribute("target", "blank")

							imgMageIcon.setAttribute(
								"src",
								`https://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${mage}.png`
							)
							classAssinsIcon.appendChild(linkToLore)
							linkToLore.appendChild(imgMageIcon)
						})

						break
					case "Marksman":
						arrOfMarksman.forEach(marksman => {
							const imgMarksmanIcon = document.createElement("img")
							const linkToLore = document.createElement("a")
							linkToLore.setAttribute(
								"href",
								`https://universe.leagueoflegends.com/pl_PL/story/champion/${marksman}/`
							)
							linkToLore.setAttribute("target", "blank")

							imgMarksmanIcon.setAttribute(
								"src",
								`https://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${marksman}.png`
							)
							classAssinsIcon.appendChild(linkToLore)
							linkToLore.appendChild(imgMarksmanIcon)
						})
						classHeadline.textContent = "Marksmen"
						break
					case "Supports":
						arrOfSupports.forEach(support => {
							const imgSupportIcon = document.createElement("img")
							const linkToLore = document.createElement("a")
							linkToLore.setAttribute(
								"href",
								`https://universe.leagueoflegends.com/pl_PL/story/champion/${support}/`
							)
							linkToLore.setAttribute("target", "blank")

							imgSupportIcon.setAttribute(
								"src",
								`https://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${support}.png`
							)
							classAssinsIcon.appendChild(linkToLore)
							linkToLore.appendChild(imgSupportIcon)
						})
						classHeadline.textContent = "Supports"
						break
					case "Tanks":
						arrOfTanks.forEach(tank => {
							const imgTankIcon = document.createElement("img")
							const linkToLore = document.createElement("a")
							linkToLore.setAttribute(
								"href",
								`https://universe.leagueoflegends.com/pl_PL/story/champion/${tank}/`
							)
							linkToLore.setAttribute("target", "blank")

							imgTankIcon.setAttribute(
								"src",
								`https://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${tank}.png`
							)
							classAssinsIcon.appendChild(linkToLore)
							linkToLore.appendChild(imgTankIcon)
						})
						classHeadline.textContent = "Tanks"
						break

					default:
						console.log("Error")
				}
			})
		})

		closePopUp.addEventListener("click", () => {
			popUpClass.style.display = "none"
			shadow.style.display = "none"
			classImgIconShowAll.replaceChildren()
		})

		showAllClassChampion.addEventListener("click", () => {
			classImgIconShowAll.style.overflowY = "scroll"
			classImgIconShowAll.style.height = "50vh"
			hideAllClassChampion.style.display = "block"
			showAllClassChampion.style.display = "none"
		})
		hideAllClassChampion.addEventListener("click", () => {
			classImgIconShowAll.style.overflowY = "hidden"
			classImgIconShowAll.style.height = "12vh"
			hideAllClassChampion.style.display = "none"
			showAllClassChampion.style.display = "block"
			classImgIconShowAll.scrollTop = 0
			classImgIconShowAll.scrollTop = 0
		})
	} catch (error) {
		console.log(error)
	}
}

getIconClass()
