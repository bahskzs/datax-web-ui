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
      <el-form-item label="目标表:">
      <el-checkbox
        v-model="writerForm.autoCreate"
        @change="columnsChange"
        >是否自动构建目标表</el-checkbox>
      </el-form-item>
      <el-form-item v-show="(dataSource==='postgresql' || dataSource==='oracle' ||dataSource==='sqlserver') " label="Schema：" prop="tableSchema">
        <el-select v-model="writerForm.tableSchema" filterable style="width: 300px" @change="schemaChange">
          <el-option
            v-for="item in schemaList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Schema[单源多目标]:" v-show="writerForm.autoCreate">
        <el-select  multiple multiple-limit="0" v-model="multipleSchema" filterable style="width: 300px" >
          <el-option
            v-for="item in schemaList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数据库表名：" prop="tableName" v-show="!writerForm.autoCreate">
        <el-select
          v-model="fromTableName"
          v-show="!writerForm.autoCreate"
          allow-create
          default-first-option
          filterable
          :disabled="writerForm.ifCreateTable"
          style="width: 300px"
          @change="wTbChange"
        >
          <el-option
            v-for="item in wTbList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <div style="margin: 5px 0;" />
      <el-form-item label="字段：">
        <el-checkbox v-model="writerForm.checkAll" :indeterminate="writerForm.isIndeterminate" @change="wHandleCheckAllChange">全选</el-checkbox>
        <div style="margin: 15px 0;" />
        <el-checkbox-group v-model="writerForm.columns" @change="wHandleCheckedChange">
          <el-checkbox v-for="c in fromColumnList" :key="c" :label="c">{{ c }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="目标表命名：" v-show="writerForm.autoCreate">
        <el-input v-model="createTableName"  style="width: 195px" />
        <el-button type="primary" @click="createTable" :loading="loading">新增</el-button>
      </el-form-item>
      <el-form-item label="前置sql语句：">
        <el-input v-model="writerForm.preSql" placeholder="前置sql在insert之前执行" type="textarea" style="width: 42%" />
      </el-form-item>
      <el-form-item label="postSql">
        <el-input v-model="writerForm.postSql" placeholder="多个用;分隔" type="textarea" style="width: 42%" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import * as dsQueryApi from '@/api/metadata-query'
import { list as jdbcDsList } from '@/api/datax-jdbcDatasource'
// import { getDataSourceList as jdbcDsList } from '@/api/datax-jdbcDatasource'
import Bus from '../busWriter'
export default {
  name: 'RDBMSWriter',
  data() {
    return {
      loading: false,
      jdbcDsQuery: {
        current: 1,
        size: 600,
        ascs: 'datasource_name',
        ifCount: true
      },
      wDsList: [],
      schemaList: [],
      fromTableName: '',
      fromColumnList: [],
      wTbList: [],
      dataSource: '',
      createTableName: this.getReaderData().tableName,
      writerForm: {
        datasourceId: undefined,
        tableName: '',
        columns: [],
        checkAll: false,
        isIndeterminate: true,
        preSql: '',
        postSql: '',
        ifCreateTable: false,
        tableSchema: '',
        autoCreate: false
      },
      multipleSchema: [],
      readerForm: this.getReaderData(),
      rules: {
        datasourceId: [{ required: true, message: 'this is required', trigger: 'change' }],
        tableName: [{ required: true, message: 'this is required', trigger: 'change' }],
        tableSchema: [{ required: true, message: 'this is required', trigger: 'change' }],
        createTableName: [{ required: true, message: 'this is required', trigger: 'change' }]
      }
    }
  },
  watch: {
    'writerForm.datasourceId': function(oldVal, newVal) {
      if (this.dataSource === 'postgresql' || this.dataSource === 'oracle' || this.dataSource === 'sqlserver') {
        this.getSchema()
      } else {
        this.getTables('rdbmsWriter')
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
      if (type === 'rdbmsWriter') {
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
      this.getTables('rdbmsWriter')
    },
    columnsChange() {
      this.getColumns('reader')
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
    },
    // 获取表字段
    getColumns() {
      var tableName = this.writerForm.tableName
      if (this.writerForm.tableSchema !== '') {
        tableName = this.writerForm.tableSchema + '.' + tableName
      }
      let obj = {
        datasourceId: this.writerForm.datasourceId,
        tableName: tableName
      }
      if (this.writerForm.autoCreate) {
        obj = {
          datasourceId: this.readerForm.datasourceId,
          tableName: this.readerForm.tableName
        }
      }
      dsQueryApi.getColumns(obj).then(response => {
        this.fromColumnList = response
        this.writerForm.columns = response
        this.writerForm.checkAll = true
        this.writerForm.isIndeterminate = false
      })
    },
    // 表切换
    wTbChange(t) {
      this.writerForm.tableName = t
      this.fromColumnList = []
      this.writerForm.columns = []
      this.getColumns('writer')
    },
    wHandleCheckAllChange(val) {
      this.writerForm.columns = val ? this.fromColumnList : []
      this.writerForm.isIndeterminate = false
    },
    wHandleCheckedChange(value) {
      const checkedCount = value.length
      this.writerForm.checkAll = checkedCount === this.fromColumnList.length
      this.writerForm.isIndeterminate = checkedCount > 0 && checkedCount < this.fromColumnList.length
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
      this.loading = true
      // writer datasource , reader datasource, reader tableName, writer tableName
      console.log('this.fromColumnList : ' + this.writerForm.columns.toString())
      let obj = {}
      console.log('this.readerForm.datasourceId:' + this.readerForm.datasourceId)
      const sourceId = this.readerForm.datasourceId
      if (this.multipleSchema.length > 0) {
        this.multipleSchema.forEach(schema => {
          const obj = {
            datasourceId: this.writerForm.datasourceId,
            tableList: [this.createTableName],
            sourceId: sourceId,
            readerTableName: this.readerForm.tableName,
            targetSchema: schema,
            sourceSchema: this.readerForm.tableSchema
          }
          console.log('obj:' + JSON.stringify(obj))
          dsQueryApi.createTables(obj).then(response => {
            this.$notify({
              title: 'Success',
              message: 'Create Table Successfully',
              type: 'success',
              duration: 2000
            })
            this.loading = false
          }).catch(() => console.log('promise catch err'))
        })
      } else {
        obj = {
          datasourceId: this.writerForm.datasourceId,
          tableName: [this.createTableName],
          sourceId: sourceId,
          readerTableName: this.readerForm.tableName,
          columnsList: this.writerForm.columns
        }
        dsQueryApi.createTable(obj).then(response => {
          this.$notify({
            title: 'Success',
            message: 'Create Table Successfully',
            type: 'success',
            duration: 2000
          })
          this.loading = false
        }).catch(() => console.log('promise catch err'))
      }
      this.writerForm.tableName = obj.tableName
      this.fromTableName = obj.tableName
      console.log('writerForm.tableName: ' + this.writerForm.tableName)
      console.log('this.fromTableName: ' + this.fromTableName)
    }
  }
}
</script>
