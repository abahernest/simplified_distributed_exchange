# Simplified Distributed Exchange

## Technologies
* NodeJs (JavaScript)
* Grenache (communication between nodes with DHT)

## Setup Project Locally

* Clone Repository

```bash
git clone `https://github.com/abahernest/simplified_distributed_exchange.git`
cd simplified_distributed_exchange
```

* Setting up the DHT
```bash
npm i -g grenache-grape
```
* boot two grape servers
```
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```
* Install dependencies `npm install`
* Start server `npm run server`
* Start Client `npm run client`

* Follow instructions In the Terminal

* IMPORTANT INFO
Read this docs for program flow (implementation under the hood)
`https://docs.google.com/document/d/10FF_gss5m1c1jemmt1YDRVa_z7JDqIKQFXny3CCtH4A/edit?usp=sharing`
