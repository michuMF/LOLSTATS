const summoners = document.querySelector(".summoners")
const showMoreSummoners = document.querySelector(".show-more-players")
const hideMoreSUmmoners = document.querySelector(".hidde-more-players")
const wrapper = document.querySelector(".wrapper2")

const rankingPlayers = async function () {
	try {
		const urlChallengers = `https://euw1.api.riotgames.com/lol/league-exp/v4/entries/RANKED_SOLO_5x5/CHALLENGER/I?page=1&api_key=${apiKey}`

		const responseChalengers = await fetch(urlChallengers)
		const topChalengerPlayers = await responseChalengers.json()
		let count = -1
		for (const [key, champion] of Object.entries(topChalengerPlayers)) {
			count++
			if (count > 20) {
			} else {
				const divRank = document.createElement("div")
				const alignment = document.createElement("div")
				const iconImg = document.createElement("img")
				const sumonnerName = document.createElement("h3")
				const rank = document.createElement("p")
				const lp = document.createElement("p")
				const wr = document.createElement("p")

				const url = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/${champion.summonerId}?api_key=${apiKey}`

				const response = await fetch(url)
				const result = await response.json()

				iconImg.setAttribute(
					"src",
					`http://ddragon.leagueoflegends.com/cdn/13.14.1/img/profileicon/${result.profileIconId}.png`
				)
				divRank.classList.add("rank")
				alignment.classList.add("alignment")
				sumonnerName.textContent = champion.summonerName
				rank.textContent = champion.tier
				lp.textContent = `LP: ${champion.leaguePoints}`

				wr.textContent = `WR: ${Math.floor(
					(champion.wins / (champion.losses + champion.wins)) * 100
				)}%`
				summoners.appendChild(divRank)
				divRank.appendChild(iconImg)
				divRank.appendChild(alignment)
				alignment.appendChild(sumonnerName)
				divRank.appendChild(rank)
				divRank.appendChild(lp)
				divRank.appendChild(wr)
			}
		}
	} catch (error) {
		console.log(error)
	}
}

showMoreSummoners.addEventListener("click", () => {
	wrapper.style.overflowY = "scroll"
	showMoreSummoners.style.display = "none"
})
hideMoreSUmmoners.addEventListener("click", () => {
	wrapper.style.overflowY = "hidden"
	showMoreSummoners.style.display = "block"
	wrapper.scrollTop = 0
	wrapper.scrollTop = 0
})

rankingPlayers()
