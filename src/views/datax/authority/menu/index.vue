<template>
  <div class="app-container">
    <div class="filter-container">
<!--      <el-input-->
<!--        v-model="listQuery.reportName"-->
<!--        clearable-->
<!--        placeholder="报表名称"-->
<!--        style="width: 200px;"-->
<!--        class="filter-item"-->
<!--        @keyup.enter.native="handleFilter"-->
<!--      />-->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <!-- <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox> -->
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="95">
        <template slot-scope="scope">{{ scope.row.id }}</template>
      </el-table-column>
      <el-table-column label="模块名称" width="200" align="center">
        <template slot-scope="scope">{{ scope.row.moduleName }}</template>
      </el-table-column>
      <el-table-column label="报表名称" width="200" align="center">
        <template slot-scope="scope">{{ scope.row.reportName }}</template>
      </el-table-column>
      <el-table-column label="报表地址" width="200" align="center">
        <template slot-scope="scope">{{ scope.row.reportAddress }}
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" :show-overflow-tooltip="true" width="100">
        <template slot-scope="scope">{{ scope.row.sort }}</template>
      </el-table-column>
<!--      <el-table-column label="区划" width="200" align="center" :show-overflow-tooltip="true">-->
<!--        <template slot-scope="scope">{{ scope.row.areaList }}</template>-->
<!--      </el-table-column>-->
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">{{ scope.row.status }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
<!--    <pagination-->
<!--      v-show="total>0"-->
<!--      :total="total"-->
<!--      :page.sync="listQuery.current"-->
<!--      :limit.sync="listQuery.size"-->
<!--      @pagination="fetchData"-->
<!--    />-->

<!--    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px">-->
<!--      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px">-->
<!--        <el-form-item label="模块名称" prop="moduleName">-->
<!--          <el-select-->
<!--            v-model="temp.moduleName"-->
<!--            placeholder="模块名称"-->
<!--            style="width: 200px"-->
<!--            @change="selectDataSource(temp.moduleName)"-->
<!--          >-->
<!--            <el-option v-for="item in moduleName" :key="item.value" :label="item.label" :value="item.value" />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="报表名称" prop="reportName">-->
<!--          <el-input v-model="temp.reportName" placeholder="报表名称" style="width: 40%" />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="报表地址" prop="reportUrl">-->
<!--          <el-input v-model="temp.reportUrl" placeholder="报表地址" style="width: 40%" />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="归属区划" prop="reportRegion">-->
<!--          <el-select-->
<!--            v-model="temp.reportRegion"-->
<!--            placeholder="归属区划"-->
<!--            multiple-->
<!--            style="width: 200px"-->
<!--          >-->
<!--            <el-option v-for="item in region" :key="item.value" :label="item.label" :value="item.value" />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="排序" prop="reportSort" >-->
<!--          <el-input-number v-model="num"  :min="1" label="描述文字"></el-input-number>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="状态" prop="status" >-->
<!--          <el-switch-->
<!--            v-model="value1"-->
<!--            active-text="启用"-->
<!--            inactive-text="禁用">-->
<!--          </el-switch>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--      <div slot="footer" class="dialog-footer">-->
<!--        <el-button @click="dialogFormVisible = false">-->
<!--          取消-->
<!--        </el-button>-->
<!--        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">-->
<!--          确认-->
<!--        </el-button>-->
<!--      </div>-->
<!--    </el-dialog>-->
<!--    <el-dialog :visible.sync="dialogPluginVisible" title="Reading statistics">-->
<!--      <el-table :data="pluginData" border fit highlight-current-row style="width: 100%">-->
<!--        <el-table-column prop="key" label="Channel" />-->
<!--        <el-table-column prop="pv" label="Pv" />-->
<!--      </el-table>-->
<!--      <span slot="footer" class="dialog-footer">-->
<!--        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>-->
<!--      </span>-->
<!--    </el-dialog>-->
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
// import Pagination from '@/components/Pagination'
import * as menuApi from '@/api/menu'

export default {
  name: 'ReportMenu',
  // components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      num: 1,
      value1: true,
      list: null,
      listLoading: false,
      total: 0,
      listQuery: {
        current: 1,
        size: 100
      },
      dialogPluginVisible: false,
      pluginData: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        moduleName: [{ required: true, message: 'this is required', trigger: 'blur' }],
        reportName: [{ required: true, message: 'this is required', trigger: 'blur' }],
        reportUrl: [{ required: true, message: 'this is required', trigger: 'blur' }],
        reportAddress: [{ required: true, message: 'this is required', trigger: 'blur' }],
        areaList: [{ required: true, message: 'this is required', trigger: 'blur' }],
        sort: [{ required: true, message: 'this is required', trigger: 'blur' }],
        status: [{ required: true, message: 'this is required', trigger: 'blur' }]
      },
      temp: {
        id: undefined,
        moduleName: '',
        reportName: '',
        reportAddress: '',
        areaList: '',
        sort: '',
        status: ''
      },
      visible: true,
      moduleName: [
        { value: '基础数据', label: '基础数据' },
        { value: '预算编制', label: '预算编制' },
        { value: '指标管理', label: '指标管理' },
        { value: '国库集中支付', label: '国库集中支付' },
        { value: '总预算会计', label: '总预算会计' },
        { value: '国库工资统发', label: '国库工资统发' }
      ],
      region: [
        { value: '3500', label: '福建省本级' },
        { value: '350100', label: '福州市' },
        { value: '350300', label: '莆田市' },
        { value: '350400', label: '三明市' },
        { value: '350500', label: '泉州市' },
        { value: '350600', label: '漳州市' },
        { value: '350700', label: '南平市' },
        { value: '350800', label: '龙岩市' },
        { value: '350900', label: '宁德市' }
      ]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      menuApi.getList(this.listQuery).then(response => {
        const { records } = response
        // const { total } = response
        // this.total = total
        this.list = records
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        moduleName: '',
        reportName: '',
        reportAddress: '',
        areaList: '',
        sort: 1,
        status: 0
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          datasourceApi.created(this.temp).then(() => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.getShowStrategy(row.datasource)
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          datasourceApi.updated(tempData).then(() => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      console.log('删除')
      const idList = []
      idList.push(row.id)
      // 拼成 idList=xx
      // 多个比较麻烦，这里不处理
      datasourceApi.deleted({ idList: row.id }).then(response => {
        this.fetchData()
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
      })
      // const index = this.list.indexOf(row)
    },
    handleFetchPv(id) {
      datasourceApi.fetched(id).then(response => {
        this.pluginData = response
        this.dialogPvVisible = true
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    changePass(value) {
      this.visible = !(value === 'show')
    }
  }
}
</script>
