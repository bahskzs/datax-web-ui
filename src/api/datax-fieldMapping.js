import request from '@/utils/request'

// datax插件api

export function list(params) {
  return request({
    url: '/api/fieldsMapping',
    method: 'get',
    params
  })
}

export function fetched(params) {
  return request({
    url: '/api/fieldsMapping/' + params,
    method: 'get'
  })
}

export function updated(data) {
  return request({
    url: '/api/fieldsMapping',
    method: 'put',
    data
  })
}

export function created(data) {
  return request({
    url: '/api/fieldsMapping',
    method: 'post',
    data
  })
}

export function deleted(data) {
  return request({
    url: '/api/fieldsMapping',
    method: 'delete',
    params: data
  })
}

export function getFieldsMappingList(params) {
  return request({
    url: '/api/fieldsMapping/all',
    method: 'get',
    params
  })
}
