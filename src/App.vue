<template>
    <div id="app">
        <img src="./assets/images/logo.png" class="logoImg">
        <router-view></router-view>
        <language class="language"></language>
    </div>
</template>

<script>
    import language from './components/language/language'

    export default {
        name: 'App',
        components: {
            language
        }
    }
</script>

<style lang="scss" type="text/scss">
    @import "assets/scss/global";
</style>
