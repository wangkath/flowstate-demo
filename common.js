let websiteInventory
let warehouseInventory
let customerBank
let useFlowstate
const websiteInventoryText = document.getElementById('websiteInventory')
const warehouseInventoryText = document.getElementById('warehouseInventory')
const customerBankText = document.getElementById('customerBank')
const progressBar = document.getElementById('progressBar')
const progressText = document.getElementById('progressText')
const button = document.getElementById('mainButton')
const crashButton = document.getElementById('crashApp')
const url = 'http://localhost:3000'
let confirmLoading = false

async function getData() {
  const res = await fetch(`${url}/data`, {
    method: 'POST',
  })
  const data = await res.json()
  websiteInventory = data.result.websiteInventory
  warehouseInventory = data.result.warehouseInventory
  customerBank = data.result.customerBank
  useFlowstate = data.result.useFlowstate
}

function updateCrashButton(state) {
  if (state === 1) {
    crashButton.innerHTML = 'Reboot Application'
    crashButton.style.background = '#128132'
  } else {
    crashButton.innerHTML = 'Crash Application'
    crashButton.style.background = '#F74C00'
  }
}

function updateLoadingButton() {
  if (confirmLoading == false) {
    button.innerHTML = 'Purchase Ferris!'
    button.style.background = '#128132'
  } else {
    button.innerHTML = 'Loading...'
    button.style.background = '#c9c9c9'
    button.style.cursor = 'default'
  }
}
function updateData() {
  warehouseInventoryText.innerText = warehouseInventory
  customerBankText.innerText = `$${customerBank}`

  if (useFlowstate) {
    document.getElementById('disableFlowstate').innerHTML = 'Disable Flowstate'
    document.getElementById('item-title').innerHTML = "Exclusive Ticket to Ferris's Concert"
    document.getElementById('item-guarantee').innerHTML =
      "Limited supply available. We're using Flowstate to ensure you aren't double-charged."
    document.getElementById('item-buy').src = './assets/concert_ticket_ferris.png'
  } else {
    document.getElementById('disableFlowstate').innerHTML = 'Enable Flowstate'
    document.getElementById('item-title').innerHTML = "Exclusive Ticket to Corro's Concert"
    document.getElementById('item-guarantee').innerHTML =
      "Limited supply available. We're not using Flowstate, so no guarantees on double-charging."
    document.getElementById('item-buy').src = './assets/concert_ticket_corro.png'
  }
}

window.onload = async function () {
  await getData()
  updateData()
}

setInterval(async () => {
  // const getUpdatedLogsUrl = `${url}/getLogs`
  // const getLogsRes = await fetch(getUpdatedLogsUrl, {
  //   method: 'POST',
  // })
  // const data = await getLogsRes.json()
  // const logList = (data.logs).split(",")
  // logList.forEach(log => {
  //   const p = document.createElement("p");
  //   p.innerHTML = log;
  //   document.getElementById('log-list').appendChild(p);
  // });
}, 1000)

async function confirmPayment() {
  confirmLoading = true
  updateLoadingButton()
  const confirmPaymentUrl = `${url}/confirmPayment`
  const confirmPaymentRes = await fetch(confirmPaymentUrl, {
    method: 'POST',
  })
  const data = await confirmPaymentRes.json()
  warehouseInventory = data.warehouseInventory
  customerBank = data.customerBank
  updateData()
  confirmLoading = false
  updateLoadingButton()
}

button.addEventListener('click', async () => {
  await confirmPayment()
})

document.getElementById('disableFlowstate').addEventListener('click', async () => {
  const toggleFlowstateUrl = `${url}/toggleFlowstate`
  try {
    const response = await fetch(toggleFlowstateUrl, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Failed to toggle crash state')
    }

    const data = await response.json()
    useFlowstate = data.useFlowstate
    if (useFlowstate) {
      alert('Enabled Flowstate!')
    } else {
      alert('Disabled Flowstate')
    }
    updateData()
  } catch (error) {
    console.error('Error toggling crash state:', error)
  }
})

document.getElementById('crashApp').addEventListener('click', async () => {
  //const AWS_ENDPOINT_URL = 'http://localhost:4566' // We're using LocalStack
  const toggleCrashUrl = `${url}/toggleCrash`
  try {
    const response = await fetch(toggleCrashUrl, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Failed to toggle crash state')
    }

    const data = await response.json()
    if (data.crashed === '1') {
      updateCrashButton(1)
      alert('Crash mode enabled!')
    } else {
      updateCrashButton(0)
      alert('Crash mode disabled!')
    }
  } catch (error) {
    console.error('Error toggling crash state:', error)
    alert('Error occurred while toggling crash state')
  }
})

document.getElementById('makeTables').addEventListener('click', async () => {
  const makeCrashTable = `${url}/createCrashTable`
  const makeInventoryTable = `${url}/createInventoryTable`
  const makeBankTable = `${url}/createBankTable`
  const makeInventoryTableReg = `${url}/createInventoryTableReg`
  const makeBankTableReg = `${url}/createBankTableReg`
  try {
    const crashResponse = await fetch(makeCrashTable, {
      method: 'POST',
    })
    if (!crashResponse.ok) {
      throw new Error('Failed to create crash table')
    }
    console.log('Crash table created successfully')

    const inventoryResponse = await fetch(makeInventoryTable, {
      method: 'POST',
    })
    if (!inventoryResponse.ok) {
      throw new Error('Failed to create inventory table')
    }
    console.log('Inventory table created successfully')

    const bankResponse = await fetch(makeBankTable, {
      method: 'POST',
    })
    if (!bankResponse.ok) {
      throw new Error('Failed to create bank table')
    }
    console.log('Bank table created successfully')

    const bankRegResponse = await fetch(makeBankTableReg, {
      method: 'POST',
    })
    if (!bankRegResponse.ok) {
      throw new Error('Failed to create bank table without flowstate')
    }
    console.log('Bank table without flowstate created successfully')

    const inventoryResponseReg = await fetch(makeInventoryTableReg, {
      method: 'POST',
    })
    if (!inventoryResponseReg.ok) {
      throw new Error('Failed to create inventory table without flowstate')
    }
    console.log('Inventory table without flowstate created successfully')

    alert('Tables created successfully!')
  } catch (error) {
    console.error('Error creating tables:', error)
    alert('Error occurred while creating tables')
  }
})

/* Displaying logs */
const logsSource = new EventSource('http://localhost:3000/logs/stream')

logsSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  const message = data.message

  // Create timestamp
  const timestamp = new Date().toLocaleTimeString()

  // Add the log message as an item to the list
  const list = document.getElementById('log-list')
  const item = document.createElement('li')
  item.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${message}`
  list.prepend(item)

  // Keep only the last 100 log entries to prevent excessive memory usage
  while (list.children.length > 100) {
    list.removeChild(list.lastChild)
  }
}
