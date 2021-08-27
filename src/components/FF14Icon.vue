<template>
    <span><img v-bind:src="url + imageId" class="ff14-icon"></span>
</template>

<script>
export default {    
    name: "FF14Icon",
    props: {
        imageId: Number,
        url: {
            type: String,
            default: "http://localhost:3000/icons/"
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