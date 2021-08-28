<template>
    <span><img v-bind:src="url + imageId" class="ff14-icon"></span>
</template>

<script>
export default {    
    name: "FF14Icon",
    props: {
        imageId: String,
        url: {
            type: String,
            default: "https://xivapi.com"
        }
    }
}
</script>

<style>
    .ff14-icon {
        height: 32px;
        width: 32px;
    }
</style>