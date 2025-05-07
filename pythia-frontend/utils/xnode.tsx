import axios from 'axios'

export async function getDataXnodeValidatorsInfo() {
  const config = {
    method: 'get' as 'get',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/getNodesValidatorsStats`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'Content-Type': 'application/json',
    },
  }
  let dado

  await axios(config).then(function (response) {
    if (response.data) {
      dado = response.data
    }
  })
  return dado
}

export async function getXnodeWithNodesValidatorsStats(id: any) {
  const data = {
    id,
  }

  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/getXnodeWithNodesValidatorsStats`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'Content-Type': 'application/json',
    },
    data,
  }
  let dado

  await axios(config).then(function (response) {
    if (response.data) {
      dado = response.data
    }
  })
  return dado
}
