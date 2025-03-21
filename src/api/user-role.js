import request from '@/utils/request'

// 历史数据用户权限配置api

export function createUserRole(data) {
  return request({
    url: '/api/history/auth/create',
    method: 'post',
    data
  })
}

export function updateUserRole(data, id) {
  return request({
    url: '/api/history/auth/update/' + id,
    method: 'put',
    data
  })
}

export function deleteUserRole(id) {
  return request({
    url: '/api/history/auth/delete/' + id,
    method: 'delete'
  })
}

export function getList(params) {
  return request({
    url: '/api/history/auth/list',
    method: 'get',
    params
  })
}

export function getDetail(id, params) {
  return request({
    url: '/api/history/auth/' + id,
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

// 历史区划
export function getAreas(params) {
  return request({
    url: '/api/history/auth/regions',
    method: 'get',
    params
  })
}

// 历史单位
export function getAgencies(params) {
  return request({
    url: '/api/history/auth/agencies',
    method: 'get',
    params
  })
}

// 历史处室
export function getOffices(params) {
  return request({
    url: '/api/history/auth/offices',
    method: 'get',
    params
  })
}

// 用户
export function getUsers(params) {
  return request({
    url: '/api/history/auth/users',
    method: 'get',
    params
  })
}