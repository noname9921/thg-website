const hireLawyer = document.getElementById('hireAlawyer')
const party = hireLawyer.querySelector('#party').value
const lawyer = hireLawyer.querySelector('#lawyer').value
const time = hireLawyer.querySelector('#time').value
hireLawyer.addEventListener('submit', async (e) => {
  e.preventDefault()
  const res = await fetch('/hire-lawyer', {
    "method": "POST",
    "headers": {"Content-Type": "application/json"},
    "body": {"user": JSON.stringify(lawyer), "message": `We have a case at ${time}, ${party} side`}
  })
})