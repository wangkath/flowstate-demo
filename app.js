const express = require('express')
const cors = require('cors')

const { continuouslyRetryFunction, createCrashTable, createInventoryTable, toggleCrashTable } = require('./index')

let page = 0
let websiteInventory = 1000
let warehouseInventory = 100
let customerBank = 1000
// let crashMode = 0 // 0 = off, 1 = on

const app = express()
app.use(cors())
app.use(express.json())

app.post('/page', (req, res) => {
  const result = page
  res.json({ result })
})

app.post('/data', (req, res) => {
  const result = {
    websiteInventory,
    warehouseInventory,
    customerBank,
  }
  res.json({ result })
})

app.post('/incrementPage', (req, res) => {
  page = page + 1
  const result = page
  res.json({ result })
})

app.post('/decrementPage', (req, res) => {
  page = page - 1
  const result = page
  res.json({ result })
})

app.post('/addToCart', (req, res) => {
  if (websiteInventory > 0) {
    websiteInventory = websiteInventory - 1
    res.status(200)
  } else {
    res.status(400)
  }
  const result = websiteInventory
  res.json({ result })
})

app.post('/confirmPayment', async (req, res) => {
  console.log('Confirming payment!')
  const LAMBDA_FUNCTION_ARN = 'arn:aws:lambda:us-east-1:000000000000:function:demo_purchase_function'

  const purchaseResponseString = await continuouslyRetryFunction(LAMBDA_FUNCTION_ARN)

  // right now the response is double serialized so we need to fix that, but for now
  // we're just double deserializing it
  let purchaseResponse = JSON.parse(purchaseResponseString)
  purchaseResponse = JSON.parse(purchaseResponse)
  console.log(`Got response ${purchaseResponse}`)

  res.json({
    warehouseInventory: purchaseResponse.inventory,
    customerBank: 88888,
  })
})

app.post('/createCrashTable', async (req, res) => {
  await createCrashTable()

  res.json({ ok: 'ok' })
})

app.post('/createTables', async (req, res) => {
  await createCrashTable()
  await createInventoryTable()

  res.json({ ok: 'ok' })
})

app.post('/createInventoryTable', async (req, res) => {
  await createInventoryTable()
  res.json({ ok: 'ok' })
})

app.post('/toggleCrash', async (req, res) => {
  let res2 = await toggleCrashTable()
  console.log('res: ', res2)
  res.json({ crashed: res2 })
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))
