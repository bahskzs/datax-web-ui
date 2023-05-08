<template>
  <div>
    <el-form label-position="right" label-width="150px" :model="writerForm" :rules="rules">
      <el-form-item label="数据库源：" prop="datasourceId">
        <el-select
          v-model="writerForm.datasourceId"
          filterable
          style="width: 300px;"
          @change="wDsChange"
        >
          <el-option
            v-for="item in wDsList"
            :key="item.id"
            :label="item.datasourceName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="dataSource==='postgresql' || dataSource==='oracle' ||dataSource==='sqlserver'" label="Schema：">
        <el-select v-model="writerForm.tableSchema" filterable style="width: 300px" @change="schemaChange">
          <el-option
            v-for="item in schemaList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="目标表:">
        <el-checkbox
          v-model="writerForm.autoCreate"
          @change="refreshTable"
        >是否自动构建目标表(注:同名表自动追加版本)
        </el-checkbox>
        <el-checkbox-group v-model="this.rTbList" v-show="writerForm.autoCreate">
          <el-checkbox v-for="c in rTbList" :key="c" :label="c">{{ c }}</el-checkbox>
        </el-checkbox-group>
        <el-button type="small" @click="createTable" v-show="writerForm.autoCreate">确认</el-button>
      </el-form-item>
      <div style="margin: 5px 0;"/>
      <el-form-item label="数据库表名：">
        <el-checkbox v-model="writerForm.checkAll" :indeterminate="writerForm.isIndeterminate" @change="wHandleCheckAllChange">
          全选
        </el-checkbox>
        <div style="margin: 15px 0;"/>
        <el-checkbox-group v-model="writerForm.tables" @change="wHandleCheckedChange">
          <el-checkbox v-for="c in wTbList" :key="c" :label="c">{{ c }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import * as dsQueryApi from '@/api/metadata-query'
import { list as jdbcDsList } from '@/api/datax-jdbcDatasource'
// import { getDataSourceList as jdbcDsList } from '@/api/datax-jdbcDatasource'
import Bus from '../busWriter'
import { uniq } from 'autoprefixer/lib/utils'

export default {
  name: 'TableWriter',
  data() {
    return {
      jdbcDsQuery: {
        current: 1,
        size: 600,
        ascs: 'datasource_name',
        ifCount: true
      },
      wDsList: [],
      schemaList: [],
      fromTableName: '',
      wTbList: [],
      dataSource: '',
      createTableName: '',
      writerForm: {
        datasourceId: undefined,
        tables: [],
        checkAll: false,
        isIndeterminate: true,
        tableSchema: ''
      },
      readerForm: this.getReaderData(),
      rules: {
        datasourceId: [{ required: true, message: 'this is required', trigger: 'change' }],
        tableName: [{ required: true, message: 'this is required', trigger: 'change' }]
      },
      rTbList: []
    }
  },
  watch: {
    'writerForm.datasourceId': function(oldVal, newVal) {
      if (this.dataSource === 'postgresql' || this.dataSource === 'oracle' || this.dataSource === 'sqlserver') {
        this.getSchema()
      } else {
        this.getTables('writer')
      }
    }
  },
  created() {
    this.getJdbcDs()
  },
  methods: {
    // 获取可用数据源
    getJdbcDs() {
      this.loading = true
      jdbcDsList(this.jdbcDsQuery).then(response => {
        const { records } = response
        this.wDsList = records
        this.loading = false
      })
    },
    // 获取表名
    getTables(type) {
      if (type === 'writer') {
        let obj = {}
        if (this.dataSource === 'postgresql' || this.dataSource === 'oracle' || this.dataSource === 'sqlserver') {
          obj = {
            datasourceId: this.writerForm.datasourceId,
            tableSchema: this.writerForm.tableSchema
          }
        } else {
          obj = {
            datasourceId: this.writerForm.datasourceId
          }
        }
        // 组装
        dsQueryApi.getTables(obj).then(response => {
          this.wTbList = response
        })
      }
      if (type === 'reader' && this.writerForm.autoCreate) {
        console.log('reader tables:' + this.readerForm.tables)
        this.rTbList = [...this.readerForm.tables]
      }
    },
    getSchema() {
      const obj = {
        datasourceId: this.writerForm.datasourceId
      }
      dsQueryApi.getTableSchema(obj).then(response => {
        this.schemaList = response
      })
    },
    // schema 切换
    schemaChange(e) {
      this.writerForm.tableSchema = e
      // 获取可用表
      this.getTables('writer')
    },
    refreshTable() {
      this.getTables('reader')
    },
    wDsChange(e) {
      // 清空
      this.writerForm.tableName = ''
      this.writerForm.datasourceId = e
      this.wDsList.find((item) => {
        if (item.id === e) {
          this.dataSource = item.datasource
        }
      })
      Bus.dataSourceId = e
      this.$emit('selectDataSource', this.dataSource)
      // 获取可用表
      this.getTables()
    },
    wHandleCheckAllChange(val) {
      this.writerForm.tables = val ? this.wTbList : []
      this.writerForm.isIndeterminate = false
    },
    wHandleCheckedChange(value) {
      const checkedCount = value.length
      this.writerForm.checkAll = checkedCount === this.wTbList.length
      this.writerForm.isIndeterminate = checkedCount > 0 && checkedCount < this.wTbList.length
    },
    getData() {
      if (Bus.dataSourceId) {
        this.writerForm.datasourceId = Bus.dataSourceId
      }
      return this.writerForm
    },
    getReaderData() {
      return this.$parent.getReaderData()
    },
    getTableName() {
      return this.fromTableName
    },
    createTable() {
      // eslint-disable-next-line no-unused-vars
      let obj = {}
      console.log('this.readerForm.datasourceId:' + this.readerForm)
      const sourceId = this.readerForm.datasourceId
      this.rTbList = [...this.readerForm.tables]
      const tList = this.rTbList
      obj = {
        datasourceId: this.writerForm.datasourceId,
        sourceId: sourceId,
        sourceSchema: this.readerForm.tableSchema,
        targetSchema: this.writerForm.tableSchema,
        tableList: tList
      }
      const appendList = [...tList]
      this.wTbList.forEach(
        e => appendList.push(e)
      )
      dsQueryApi.createTables(obj).then(response => {
        console.log(response)
        this.$notify({
          title: 'Success',
          message: 'Create Table Successfully',
          type: 'success',
          duration: 1000
        })
        this.wTbList = appendList
        this.writerForm.tables = tList
      }).catch(() => console.log('promise catch err'))
    }
  }
}
</script>
