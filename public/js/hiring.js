const hireLawyer = document.getElementById('hireAlawyer')

hireLawyer.addEventListener('submit', async (e) => {
  e.preventDefault()
  const party = hireLawyer.querySelector('#party').value
  const lawyer = hireLawyer.querySelector('#lawyer').value
  const time = hireLawyer.querySelector('#time').value
  console.log(`We have a case at ${time}, ${party} side, @${lawyer}`)
  const res = await fetch('/send', {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({"message": `We have a case at ${time}, ${party} side, <@${lawyer}>`})
  })
})