const express = require('express')
const cors = require('cors')

const { continuouslyRetryFunction, createCrashTable, createInventoryTable, createBankTable, createInventoryTableReg, createBankTableReg, toggleCrashTable } = require('./index')

let websiteInventory = 1000
let warehouseInventory = 100
let customerBank = 1000
let useFlowstate = true

const app = express()
app.use(cors())
app.use(express.json())

app.post('/data', (req, res) => {
  const result = {
    websiteInventory,
    warehouseInventory,
    customerBank,
    useFlowstate
  }
  res.json({ result })
})

app.post('/confirmPayment', async (req, res) => {
  const LAMBDA_FUNCTION_ARN = useFlowstate ? 'arn:aws:lambda:us-east-1:000000000000:function:demo_purchase_function' : 'arn:aws:lambda:us-east-1:000000000000:function:demo_purchase_function_no_flowstate:4'
  
  const purchaseResponseString = await continuouslyRetryFunction(LAMBDA_FUNCTION_ARN)

  // right now the response is double serialized so we need to fix that, but for now
  // we're just double deserializing it

  let purchaseResponse = JSON.parse(purchaseResponseString)
  purchaseResponse = JSON.parse(purchaseResponse)
  console.log(`Got response ${purchaseResponse}`)
  console.log(purchaseResponse.inventory)
  console.log(purchaseResponse.bank)

  res.json({
    warehouseInventory: purchaseResponse.inventory,
    customerBank: purchaseResponse.bank,
  })
})

app.post('/createCrashTable', async (req, res) => {
  await createCrashTable()

  res.json({ ok: 'ok' })
})

app.post('/createTables', async (req, res) => {
  await createCrashTable()
  await createInventoryTable()
  await createBankTable()
  await createInventoryTableReg()
  await createBankTableReg()

  res.json({ ok: 'ok' })
})

app.post('/createInventoryTable', async (req, res) => {
  await createInventoryTable()
  res.json({ ok: 'ok' })
})

app.post('/createBankTable', async (req, res) => {
  await createBankTable()
  res.json({ ok: 'ok' })
})

app.post('/createBankTableReg', async (req, res) => {
  await createBankTableReg()
  res.json({ ok: 'ok' })
})

app.post('/createInventoryTableReg', async (req, res) => {
  await createInventoryTableReg()
  res.json({ ok: 'ok' })
})

app.post('/toggleCrash', async (req, res) => {
  let res2 = await toggleCrashTable()
  console.log('res: ', res2)
  res.json({ crashed: res2 })
})

app.post('/toggleFlowstate', (req, res) => {
  useFlowstate = !useFlowstate
  res.json({ useFlowstate })
})

/* Logging utils */
const sseClients = []

// Subscribe to logs
app.get('/logs/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  res.write(`data: Connected to SSE stream\n\n`)

  sseClients.push(res)

  req.on('close', () => {
    const index = sseClients.indexOf(res)
    if (index !== -1) {
      sseClients.splice(index, 1)
    }
  })
})

// Helper function for broadcasting a log to all clients
function broadcastLog(message) {
  console.log('Broadcasting log:', message)
  sseClients.forEach((client) => {
    client.write(`data: ${JSON.stringify({ message })}\n\n`)
  })
}

// Log a message
app.post('/logs', (req, res) => {
  const { message } = req.body

  if (!message) {
    return res.status(400).json({ error: 'No message provided' })
  }

  broadcastLog(message)

  res.status(200).json({ success: true })
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))
