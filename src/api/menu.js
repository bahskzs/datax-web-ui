import request from '@/utils/request'

// 历史数据菜单配置api

export function createReport(data) {
  return request({
    url: '/api/menu/create',
    method: 'post',
    data
  })
}

export function updateReport(data, id) {
  return request({
    url: '/api/menu/update/' + id,
    method: 'put',
    data
  })
}

export function deleteReport(id) {
  return request({
    url: '/api/menu/delete' + id,
    method: 'delete'
  })
}

export function getList(params) {
  return request({
    url: '/api/menu/list',
    method: 'get'
  })
}

export function getDetail(id, params) {
  return request({
    url: '/api/menu/list',
    method: 'get',
    params
  })
}

export function getModules() {
  return request({
    url: '/api/menu/modules',
    method: 'get'
  })
}

export function getAreas() {
  return request({
    url: '/api/menu/area',
    method: 'get'
  })
}
