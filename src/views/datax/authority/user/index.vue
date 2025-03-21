<template>
  <div class="app-container">
      <div class="filter-container">
        <el-input v-model="listQuery.userName" clearable placeholder="用户名称" style="width: 200px;" class="filter-item"
          @keyup.enter.native="fetchData"/>
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
    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label="序号" width="80" fixed>
        <template slot-scope="scope">{{ scope.row.id }}</template>
      </el-table-column>
      <el-table-column label="用户" width="120" align="center" fixed>
        <template slot-scope="scope">{{ scope.row.userid }}</template>
      </el-table-column>
      <el-table-column label="用户账号" width="200" align="center" style="display: none;" fixed>
        <template slot-scope="scope" style="display: none;">{{ scope.row.userInfo }}</template>
      </el-table-column>
      <el-table-column label="菜单权限" width="200" align="center" fixed>
        <template slot-scope="scope">{{ scope.row.modules }}
        </template>
      </el-table-column>
      <el-table-column label="区划" align="center" :show-overflow-tooltip="true" width="200" >
        <template slot-scope="scope">{{ scope.row.regions }}</template>
      </el-table-column>
      <el-table-column label="单位" width="300" align="center" :show-overflow-tooltip="true" >
        <template slot-scope="scope">{{ scope.row.agencies }}</template>
      </el-table-column>
      <el-table-column label="处室" width="300" align="center" :show-overflow-tooltip="true" >
        <template slot-scope="scope">{{ scope.row.offices }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center" >
        <template slot-scope="scope">{{ scope.row.status }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center"  class-name="small-padding fixed-width" width="250" >
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status != 'deleted'" size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- <pagination
      v-show="total>0"
         :total="total"
         :page.sync="listQuery.current"
         :limit.sync="listQuery.size"
         @pagination="fetchData"
       /> -->

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px">
        <el-form-item label="用户" >
          <el-select
              v-model="temp.userInfo"
              filterable
              remote
              clearable
              reserve-keyword
              placeholder="请输入用户名"
              :remote-method="fetchUser"
              :loading="userLoading"
              :disabled="dialogStatus === 'update'"
              @change="handleUserChange"
              style="width: 500px">
              <el-option
                v-for="item in userOptions"
                :key="item.guid"
                :label="item.name + '/' + item.code + '/' + item.province"
                :value="item.guid + '-' + item.name + '-' + item.code + '-' + item.province + '-'+ item.phonenumber">
              </el-option>
          </el-select>
          <!-- <el-input v-model="temp.reportName" placeholder="用户名" style="width: 40%" />
          <el-button type="primary" @click="dialogPluginVisible = true">查询</el-button> -->
        </el-form-item>
        <el-form-item label="模块名称" prop="modules">
          <el-checkbox-group label="模块名称" v-model="temp.modules" >
            <el-checkbox v-for="item in moduleName" :key="item.value" :label="item.label" >{{ item.value }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="历史区划" prop="regions">
          <el-cascader

            :options="oldRegions"
            :props="{ multiple: true ,checkStrictly: true, emitPath: false }"
            clearable
            filterable
            v-model="temp.regions"
            style="width: 500px"
            @change="handleRegionsChange"
          ></el-cascader>
          <el-button type="primary" @click="clearAreas">
          清空默认区划
          </el-button>
        </el-form-item>
        <el-form-item label="历史单位" prop="agencies">
          <el-cascader
            ref="cascader1"
          :options="oldAgencies"
          @visible-change="handleOptionChange"
          :props="{multiple: true, emitPath: false}" :show-all-levels="true"
            collapse-tags
          clearable
          filterable
          v-model="temp.agencies"
            style="width: 500px"></el-cascader>
        </el-form-item>
        <el-form-item label="历史处室">
          <el-cascader :options="oldOffices"
                       ref="cascader2"
          @visible-change="handleOptionChange2"
          :props="{ multiple: true , emitPath: false}"
                       clearable
                       filterable
                       collapse-tags
                       v-model="temp.offices"
            style="width: 500px"></el-cascader>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="value1" active-text="启用" inactive-text="禁用">
          </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
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
import waves from '@/directive/waves'; // waves directive
// import Pagination from '@/components/Pagination'
import * as userRoleApi from '@/api/user-role';

export default {
  name: 'UserRole',
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
      selectedRegions: [], // 存储选中的oldRigons的值
      selectedYear: null,
      years: ['2017', '2018', '2019', '2020', '2021'],
      userLoading: false,
      num: 1,
      value1: true,
      list: null,
      listLoading: true,
      total: 0,
      listQuery: {
        userName: ''
        // current: 1,
        // size: 10
      },
      regionsQuery: {
        areaCode: null
      },
      menuObj: {
        moduleName: '',
        reportName: '',
        reportUrl: '',
        reportAddress: '',
        areaArr: '',
        sort: '',
        status: ''
      },
      userRoleObj: {
        id: '',
        userid: '',
        userInfo: '',
        modules: [],
        regions: '',
        agencies: '',
        offices: '',
        status: ''
      },
      temp: {
        id: '',
        userInfo: '',
        modules: [],
        regions: [],
        agencies: null,
        offices: null,
        status: true,
        agencyPaths: null,
      },
      rules: {
        userInfo: [{ required: true, message: 'this is required', trigger: 'blur' }],
        modules: [{ required: true, message: 'this is required', trigger: 'blur' }],
        regions: [{ required: true, message: 'this is required', trigger: 'blur' }],
        agencies: [{ required: false, message: '', trigger: 'blur' }],
        offices: [{ required: false, message: '', trigger: 'blur' }],
        status: [{ required: true, message: 'this is required', trigger: 'blur' }]
      },
      dialogPluginVisible: false,
      pluginData: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      visible: true,
      moduleName: [
        { label: '基础数据', value: '基础数据' },
        { label: '预算编制', value: '预算编制' },
        { label: '指标管理', value: '指标管理' },
        { label: '国库集中支付', value: '国库集中支付' },
        { label: '总预算会计', value: '总预算会计' },
        { label: '国库工资统发', value: '国库工资统发' }
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
      ],
      oldRegions: null,
      oldAgencies: null,
      oldOffices: null,
      userOptions: null
    }
  },
  created() {
    this.fetchData()
    this.fetchOldRegions()
    // this.fetchOldAgencies(),
    // this.delayedFetchOldOffices(),
    this.fetchUser('')
  },
  methods: {
    clearAreas() {
      this.regionsQuery.areaCode = null
      this.fetchOldRegions()
    },
    handleOptionChange() {
      this.fetchOldAgencies()
    },
    handleOptionChange2() {
      this.fetchOldOffices()
    },

    handleRegionsChange(value) {
      this.selectedRegions = value // 将选中的值存储到selectedRigons变量中
      // this.fetchOldOffices(); // 调用查询方法，传递选中的值作为参数
    },
    handleUserChange(value) {
      const users = value.split('-')
      // 取users[3]的值的前两位
      this.regionsQuery.areaCode = users[3].substring(0, 6)
      this.fetchOldRegions()
    },
    delayedFetchOldOffices() {
      setTimeout(() => {
        this.fetchOldOffices()
      }, 1000) // 延迟1秒加载fetchOldOffices方法
    },
    transformToNested(options = []) {
      const map = new Map()
      options.forEach(option => {
        if (!map.has(option.year)) {
          map.set(option.year, {
            value: option.year,
            label: option.year,
            children: []
          })
        }
        map.get(option.year).children.push({
          value: option.year + '-' + option.code,
          label: option.code + '-' + option.name + '-' + option.areaCode
        })
      })
      const sortedArray = Array.from(map.values()).sort((a, b) => {
        return b.label.localeCompare(a.label) // 修改比较函数，实现降序排序
      })
      return sortedArray
    },
    transformToNested2(options = []) {
      const map = new Map()
      options.forEach(option => {
        if (!map.has(option.year)) {
          map.set(option.year, {
            value: option.year,
            label: option.year,
            children: []
          })
        }
        map.get(option.year).children.push({
          value: option.year + '-' + option.code + '-' + option.name + '-' + option.areaCode,
          label: option.code + '-' + option.name + '-' + option.areaCode
        })
      })
      return Array.from(map.values())
    },
    transformToNested3(options = []) {
      const yearMap = new Map()
      const idMap = new Map()

      options.forEach(option => {
        if (!idMap.has(option.id)) {
          idMap.set(option.id, {
            value: option.id,
            label: option.code + '-' + option.name + '-' + option.areaCode,
            children: []
          })
        }
      })

      options.forEach(option => {
        const node = idMap.get(option.id)
        if (option.pid) {
          const parent = idMap.get(option.pid)
          if (parent) {
            parent.children.push(node)
          }
        }

        if (!yearMap.has(option.year)) {
          yearMap.set(option.year, {
            value: option.year,
            label: option.year,
            children: []
          })
        }

        if (!option.pid) {
          yearMap.get(option.year).children.push(node)
        }
      })

      return Array.from(yearMap.values())
    },
    transformToNested4(options = []) {
      let result = []
      const years = [...new Set(options.map(option => option.year))] // 获取所有的年份

      years.forEach(year => {
        let yearData = {
          value: year,
          label: year,
          children: []
        }

        let nodeMap = new Map()

        // 创建所有节点
        options.forEach(option => {
          if (option.year === year) {
            let node = {
              value: option.year + '-' + option.code + '-' + option.name + '-' + option.areaCode,
              label: option.code + '-' + option.name + '-' + option.areaCode
            }
            nodeMap.set(option.code, node)
          }
        })

        // 为每个节点添加子节点
        options.forEach(option => {
          if (option.year === year) {
            let parentNode = null

            // 寻找这个节点的父节点
            for (let [code, node] of nodeMap.entries()) {
              if (option.code !== code && option.code.startsWith(code)) {
                if (!parentNode || code.length < parentNode.label.length) {
                  parentNode = node
                }
              }
            }

            // 如果找到父节点，将这个节点添加到父节点的子节点列表中
            if (parentNode) {
              if (!parentNode.children) {
                parentNode.children = []
              }
              parentNode.children.push(nodeMap.get(option.code))

              // 根据 code 对子节点进行排序
              parentNode.children.sort((a, b) => {
                const codeA = a.label.split('-')[0]
                const codeB = b.label.split('-')[0]
                return codeA.localeCompare(codeB)
              })
            } else {
              // 如果没有找到父节点，那么这个节点就是根节点
              yearData.children.push(nodeMap.get(option.code))
            }
          }
        })

        // 根据 code 对根节点进行排序
        yearData.children.sort((a, b) => {
          const codeA = a.label.split('-')[0]
          const codeB = b.label.split('-')[0]
          return codeA.localeCompare(codeB)
        })

        result.push(yearData)
      })

      return result
    },
    fetchData() {
      this.listLoading = true
      userRoleApi.getList(this.listQuery).then(response => {
        const records = response
        records.forEach(item => {
          item.status = (item.status === '0' ? '启用' : '禁用')
        })
        this.list = records
        this.list.map(item => {
          item.userid = item.userInfo.split('-')[1] + '-' + item.userInfo.split('-')[3]
          + '-'  + item.userInfo.split('-')[4]
        })
        // const { content } = response
        // this.total = content.recordsTotal
        // this.list = content.data

        // 遍历records
        this.listLoading = false
      })
    },
    fetchUser(query) {
      if (query !== '') {
        this.userLoading = true;
        setTimeout(() => {
          const param = {
            name: query,
            code: '',
            areaCode: '',
          }
          userRoleApi.getUsers(param).then(response => {
            const records = response
            if (Array.isArray(records)) {
              this.userOptions = records
            } else {
              console.error('records is not an array:', records)
            }
          }).finally(() => {
            this.userLoading = false // 将此行代码移动到请求完成后的回调函数中
          })
        }, 200)
      } else {
        this.userOptions = []
        this.userLoading = false // 将此行代码移动到 else 分支中
      }
    },
    fetchOldRegions() {
      userRoleApi.getAreas(this.regionsQuery).then(response => {
        const records = response
        if (Array.isArray(records)) {
          this.oldRegions = this.transformToNested(records)
        } else {
          console.error('records is not an array:', records)
        }
      })
    },
    fetchOldAgencies() {
      let param = {
        areaCodes: []
      }
      if (this.selectedRegions.length > 0) {
        this.selectedRegions.forEach(item => {
          param.areaCodes.push(item) // 将每个item添加到areaCodes数组中
        })

        const params = new URLSearchParams()
        param.areaCodes.forEach(areaCode => {
          params.append('areaCodes', areaCode) // 将每个areaCode添加到URLSearchParams中
        })
        userRoleApi.getAgencies(params).then(response => {
          const records = response
          if (Array.isArray(records)) {
            this.oldAgencies = this.transformToNested4(records)
          } else {
            console.error('records is not an array:', records)
          }
        })
      }
    },
    fetchOldOffices() {
      let param = {
        areaCodes: []
      }
      if (this.selectedRegions.length > 0) {
        console.log('选中的区划:' + this.selectedRegions[this.selectedRegions.length - 1])

        this.selectedRegions.forEach(item => {
          param.areaCodes.push(item) // 将每个item添加到areaCodes数组中
        })

        const params = new URLSearchParams()
        param.areaCodes.forEach(areaCode => {
          params.append('areaCodes', areaCode) // 将每个areaCode添加到URLSearchParams中
        })
        userRoleApi.getOffices(params).then(response => {
          const records = response
          if (Array.isArray(records)) {
            this.oldOffices = this.transformToNested2(records)
          } else {
            console.error('records is not an array:', records)
          }
        })

      } else {
        if (this.oldOffices) {
          // 如果已经有缓存的数据，则直接使用缓存的结果
          return
        }
      }
    },
    resetTemp() {
      this.temp = {
        id: '',
        userid: '',
        userInfo: '',
        modules: [],
        regions: '',
        agencies: '',
        offices: '',
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
      let cascaderInstance
      if (this.temp.agencies === '') {
        this.temp.agencies = [] // 将空字符串赋值为一个空数组
      } else {
        cascaderInstance = this.$refs.cascader1
        this.temp.agencyPaths = this.temp.agencies
        this.temp.agencies = cascaderInstance.getCheckedNodes(true).map(
          (item) => {
            return item.data.value
          }
        )
      }
      if (this.temp.offices === '') {
        this.temp.offices = [] // 将空字符串赋值为一个空数组
      } else {
        cascaderInstance = this.$refs.cascader2
        this.temp.offices = cascaderInstance.getCheckedNodes(true).map(
          (item) => {
            return item.data.value
          }
        )
      }
      if (this.value1 === true) {
        this.temp.status = 0
      } else {
        this.temp.status = 1
      }
      console.log('新增数据', this.temp)

      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // this.temp.areaList = this.temp.areaList.map(
          //   (item) => {
          //     return {
          //       'areaCode': item,
          //       'areaName': this.region.find((region) => region.value === item).label
          //     }
          //   }
          // )
          userRoleApi.createUserRole(this.temp).then(() => {
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
      const data = Object.assign({}, row) // copy obj
      this.temp.id = data.id
      this.temp.userInfo = data.userInfo
      this.temp.modules = data.modules.split(',')
      this.regionsQuery.areaCode = null
      this.temp.regions = data.regions.split(',')
      this.selectedRegions = this.temp.regions
      this.temp.agencies = data.agencies.split(',')
      this.temp.offices = data.offices.split(',')
      this.fetchOldOffices()
      this.fetchOldAgencies()
      this.value1 = data.status === '禁用' ? false : true
      console.log('编辑数据', this.temp)
      this.temp.modules = Array.from(this.temp.modules) // 创建一个新的数组
      this.temp.offices = Array.from(this.temp.offices) // 创建一个新的数组
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      if (this.value1 === true) {
        this.temp.status = 0
      } else {
        this.temp.status = 1
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          userRoleApi.updateUserRole(tempData, this.temp.id).then(() => {
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
      // 拼成 idList=xx
      // 多个比较麻烦，这里不处理
      userRoleApi.deleteUserRole(row.id).then(response => {
        this.fetchData()
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
      })
      // const index = this.list.indexOf(row)
    }
  }
}
</script>
