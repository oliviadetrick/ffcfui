<template>
    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li v-for="item in items" :key="item.name" class="nav-item">
            <a
                class="nav-link"
                href="#"
                v-bind:class="{ active: item.active }"
                v-bind:aria-current="item.active ? 'page' : ''"
                v-on:click="switchView(item)"
            >
                {{ item.text }}
            </a>
        </li>
    </ul>
</template>

<script>
    export default {
        name: "BSNavBarNav",
        props: {
            items: {
                type: Array,
            },
        },
        methods: {
            switchView: function(item) {
                if (!item.active) {
                    this.items.forEach(i => {
                        if (i !== item) {
                            i.active = false;
                        }
                    });
                    item.active = true;
                    this.$emit("switchView", item);
                }
            },
        },
    };
</script>
