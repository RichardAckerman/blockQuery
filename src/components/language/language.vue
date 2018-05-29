<template>
    <el-select class="language-style" v-model="value" size="mini">
        <el-option
                v-for="(item,index) in options"
                :key="index"
                :label="item.title"
                :value="item.label"
        ></el-option>
    </el-select>
</template>

<script>
    export default {
        name: "language",
        data() {
            return {
                value: 'ch',
                options: [
                    {title: '中文', label: 'ch'},
                    {title: 'English', label: 'en'}
                ]
            }
        }
    }
</script>

<style scoped lang="scss">
    .el-select{
        width: 90px;
    }
</style>