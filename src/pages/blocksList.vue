<template>
    <div class="container">
        <div class="search-box" v-show="!showList">
            <el-input v-model="blockNumber" placeholder="请输入区块高度/区块hash/交易hash"></el-input>
            <span class="detail-search-btn" @click="query()"></span>
        </div>
        <div class="content" v-show="showList">
            <el-header>
                <el-row>
                    <el-col :span="9" :offset="6">
                        <el-input v-model="blockNumber" placeholder="请输入区块高度/区块hash/交易hash"></el-input>
                    </el-col>
                    <el-col :span="3">
                        <el-button @click="query()">搜索</el-button>
                    </el-col>
                </el-row>
            </el-header>
            <div class="body-table">
                <el-table height="100%"
                          :data="blockData"
                          style="color:#8490c5;font-size: 16px;background:#221d44;text-align:center;"
                          :header-cell-style="headerCellStyle"
                          :row-style="rowStyle"
                          :cell-style="{'border-bottom':'none'}"
                >
                    <el-table-column
                            prop="number"
                            label="区块高度">
                        <template slot-scope="scope">
                            <a style="color: #B9B4E8"
                               :title="scope.row.number"
                               href="javascript:void(0)"
                               @click.prevent="query(scope.row.number)">
                                {{ scope.row.number }}
                            </a>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="hash"
                            width="650"
                            label="区块hash">
                        <template slot-scope="scope">
                            <a style="color: #B9B4E8"
                               :title="scope.row.hash"
                               href="javascript:void(0)"
                               @click.prevent="query(scope.row.hash)">
                                {{ scope.row.hash }}
                            </a>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="timestamp"
                            label="出块时间"
                            min-width="200">
                    </el-table-column>
                    <el-table-column
                            prop="uncles.length"
                            label="叔块">
                    </el-table-column>
                    <el-table-column
                            prop="miner"
                            label="矿工"
                            min-width="300px">
                    </el-table-column>
                    <el-table-column
                            prop="gasUsed"
                            label="交易佣金">
                    </el-table-column>
                    <el-table-column
                            prop="gasLimit"
                            label="佣金上限">
                    </el-table-column>
                </el-table>
            </div>
            <div class="tc">
                <el-pagination
                        background
                        @size-change="sizeChange"
                        @current-change="currentChange"
                        :current-page="currentPage"
                        :page-size="times"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="total">
                </el-pagination>
            </div>
        </div>
        <div class="content" v-show="!showList">
            <div class="body-detail">
                <div class="detail-head">
                    <span>{{ title }}</span>
                    <el-button size="mini" @click="backList">返回列表</el-button>
                </div>
                <div class="tx-list">
                    <div class="row" v-for="(value,key) in blockData[0]" :key="key">
                        <div class="key">{{ key }}</div>
                        <div class="value">{{ value == '' ? " " : value }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "blocks-list",
        data() {
            return {
                title: '区块信息',
                language: '', // 语言
                blockData: [], // 表格数据
                currentTimes: 0, //
                times: 20, // 每页显示数据条数
                blockNumber: '', //搜索的区块值
                showList: true,
                currentPage: 0, // 当前页
                total: 0, // 总条数
                flag: false
            }
        },
        computed: {
            lastBlockNumber() {
                return this.$web3.eth.getBlockNumber()
            }
        },
        methods: {
            /**
             *  传入区块号进行查询
             * @param bNum 区块号
             * @param times 区块号
             */
            getBlockList(bNum, times) {
                this.$web3.eth.getBlock(bNum, true, (err, obj) => {
                    if (err) {
                        this.$message.error(String(err))
                        return
                    }
                    if (obj) {
                        obj.timestamp = this.dateFormate(obj.timestamp)
                        delete obj.logsBloom
                        // this.$web3.eth.getBlockTransactionCount(this.blockNumber, (error,result)=>{
                        //     if (error) {
                        //         this.$message.error(error)
                        //         return
                        //     }
                        // obj.txn = result
                        this.blockData.push(obj)
                        if (times === 1) {
                            if (this.blockData.length === 0) {
                                this.$message.error('未查到相应数据')
                            }
                            return
                        }
                        this.currentTimes++
                        bNum--
                        if (bNum < 0) {
                            this.flag = true
                        } else if (this.currentTimes < this.times) {
                            this.getBlockList(bNum)
                            this.flag = false
                        } else {
                            this.flag = true
                        }
                        // })
                    } else {
                        this.$web3.eth
                            .getTransaction(this.blockNumber.trim())
                            .then((result) => {
                                if (result) {
                                    this.showList = false
                                    this.blockData.length = 0
                                    this.currentTimes = 0
                                    this.blockData.push(result)
                                    this.title = '交易信息'
                                } else {
                                    this.$message({
                                        showClose: true,
                                        message: '未查到任何信息！',
                                        type: 'error'
                                    })
                                }
                            })
                    }
                })
            },
            /**
             * 时间格式化
             * @param result
             * @returns {string}
             */
            dateFormate(result) {
                if (String(result).length === 10) {
                    result *= 1000
                }
                let date = new Date(result * 1)//时间戳为10位需*1000，时间戳为13位的话不需乘1000
                let Y = date.getFullYear() + '-'
                let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
                let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())+ ' '
                let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
                let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
                let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
                console.log(Y + M + D + h + m + s)
                return Y + M + D + h + m + s
                // if (result !== 0) {
                //     result = (Date.parse(new Date()) - result) / 1000
                // }
                // if (result > (60 * 60 - 1)) {
                //     result = Math.floor(result / 60 / 60) + ' hr ' + (Math.floor(result / 60)) % 60 + ' mins'
                // } else if (result > 59) {
                //     result = (result / 60).toFixed(0) + ' mins'
                // } else {
                //     result = result + ' secs'
                // }
                // return result + ' ago'
            },
            /**
             * 查询
             */
            query(blockNum) {
                if (blockNum) {
                    if (!this.flag) {
                        this.$message.error('数据请等待数据加载完成！')
                        return
                    }
                    this.title = '区块信息'
                    this.showList = false
                    this.blockData.length = 0
                    this.currentTimes = 0
                    this.getBlockList(blockNum, 1)
                } else {
                    if (this.blockNumber.trim() === '') {
                        this.$message({
                            showClose: true,
                            message: '请输入正确的区块编号或hash！',
                            type: 'error'
                        })
                        return
                    }
                    if (isNaN(Number(this.blockNumber))) {
                        this.$message.error('查询参数格式不对！')
                        return
                    }
                    this.blockData.length = 0
                    this.currentTimes = 0
                    this.getBlockList(this.blockNumber.trim(), 1)
                }
            },
            /**
             * 返回表格
             */
            backList() {
                this.times = 20 //todo
                this.currentTimes = 0
                this.showList = true
                this.blockData.length = 0
                this.blockNumber = ''
                this.lastBlockNumber.then((num) => {
                    this.getBlockList(num)
                })
            },
            /**
             * pageSize 改变时会触发
             */
            sizeChange(pageSize) {
                this.times = pageSize
                this.currentTimes = 0
                this.blockData.length = 0
                this.lastBlockNumber.then((num) => {
                    this.getBlockList(num)
                })
            },
            /**
             * currentPage 改变时会触发
             */
            currentChange(index) {
                this.blockNumber = ''
                let timer = setInterval(() => {
                    if (this.flag) {
                        clearInterval(timer)
                        this.currentTimes = 0
                        this.blockData.length = 0
                        this.lastBlockNumber.then((num) => {
                            let bNum = num - (this.times * (index - 1))
                            this.getBlockList(bNum)
                        })
                    }
                }, 1)
            },
            headerCellStyle({row, rowIndex}) {
                return 'background:#342C67;border-bottom:0;font-size: 20px;color: #d3ceff;height:70px;text-align:center;'
            },
            rowStyle({row, rowIndex}) {
                if (rowIndex & 1) {
                    return 'background:#342C67;'
                } else {
                    return 'background:#221d44;'
                }
            }

        },
        mounted() {
            this.lastBlockNumber.then((num) => {
                this.getBlockList(num)
                this.total = num
            })
        }
    }
</script>

<style lang="scss" type="text/scss" scoped>
    .container {
        height: calc(100% - 70px);
        margin-top: 70px;
        padding: 20px;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        background: rgba(25, 21, 46, 0.7);
        position: relative;

        .search-box {
            width: 400px;
            height: 40px;
            position: absolute;
            top: -55px;
            right: 150px;
            .el-input {
                width: 356px;
            }
            .detail-search-btn {
                position: absolute;
                top: 0;
                right: 0;
                display: inline-block;
                width: 44px;
                height: 44px;
                cursor: pointer;
                background: url("../assets/images/icon_seach.png") 13px 13px no-repeat;
                background-color: #403A6D;
                &:hover {
                    background: url("../assets/images/icon_seach_active.png") 13px 13px no-repeat;
                    background-color: #5D5898;
                }
            }
        }
        .content {
            width: 100%;
            height: 100%;
            padding: 0 4%;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            overflow-y: auto;

            .el-header {
                .el-input {
                    height: 50px;
                }
                .el-button {
                    margin-left: 10px;
                    padding: 0 50px;
                    line-height: 44px;
                    background-color: #403a6d;
                    border: 0;
                    font-size: 20px;
                    color: #cec8ff;
                    &:hover {
                        background-color: #5D5898;
                    }
                }
            }
            .body-table {
                height: calc(100% - 120px);
                min-height: 200px;
                overflow-y: auto;
            }
            .el-pagination {
                margin-top: 20px;
            }

            .body-detail {
                width: 1000px;
                height: 100%;
                margin: 0 auto;
                .detail-head {
                    text-align: center;
                    font-size: 18px;
                    color: #d3ceff;
                    line-height: 50px;
                    position: relative;
                    .el-button {
                        position: absolute;
                        top: 10px;
                        right: 0;
                        border: none;
                        float: right;
                        background-color: #403a6d;
                        color: #cec8ff;
                        &:hover {
                            background-color: #5D5898;
                        }
                    }
                }
                .tx-list {
                    max-height: calc(100% - 60px);
                    min-height: 300px;
                    overflow-y: auto;
                    background-color: rgba(32, 28, 68, 0.6);
                    box-shadow: 0px 18px 43px 0px rgba(25, 21, 46, 0.07);
                    border-radius: 2px;
                    border: solid 1px #322d5d;
                    .row {
                        line-height: 38px;
                        position: relative;
                        min-height: 38px;
                        &:after {
                            content: '';
                            display: table;
                            clear: both;
                        }
                        .key {
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            width: 200px;
                            font-size: 16px;
                            color: #cec8ff;
                            text-align: right;
                            padding-right: 40px;
                            background-color: rgba(58, 52, 106, 0.1);
                            box-shadow: 1px 0px 0px 0px rgba(57, 53, 102, 0.35);
                        }
                        .value {
                            float: right;
                            width: calc(100% - 280px);
                            padding-left: 40px;
                            font-size: 14px;
                            color: #8490c5;
                        }
                    }
                }
            }
        }

        .el-table::before {
            height: 0; //勿删
        }
    }
</style>
