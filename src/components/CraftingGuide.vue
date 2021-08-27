<script>
    import FF14Icon from './FF14Icon';
    import { h } from 'vue';

    export default {
        name: "CraftingGuide",
        components: {
            FF14Icon
        },
        props: {
            links: Array,
            nodes: Array,
        },
        render() {
            let steps = [];
            let nodes = [];
            for(let i = 0; i < this.nodes.length; i++) {
                let node = this.nodes[i];
                if(node.ItemID < 0) {
                    nodes.push({
                        depth: node.depth,
                        name: node.Name,
                        ItemID: node.ItemID,
                        node: node
                    });
                }
            }
            
            let linkCache = [];
            //sort by depth and name
            nodes.sort((a, b) => a.depth - b.depth || a.name.localeCompare(b.name));
            for(let i = 0; i < nodes.length; i++) {
                let node = nodes[i];
                if(node.ItemID < 0) {
                    let subSteps = [h('div', {"class": "fw-bold"}, node.name)];
                    this.links.forEach(link => {
                        if(link.source.Name === node.node.Name && link.source.depth === node.node.depth && linkCache.indexOf(link) < 0) {
                            let icon = h(FF14Icon, {"image-id": link.target.Icon});
                            let text = h('span', {"class" : "ms-2"}, `${link.target.value}x ${link.target.Name}`)
                            subSteps.push(h('p', null, icon, text))
                            linkCache.push(link);
                        }
                    });
                    if(subSteps.length > 1) {
                        let stepBody = h('div', {"class": "ms-2 me-auto"}, subSteps)
                        let stepElement = h('li', {
                            "class": "list-group-item d-flex align-items-start"
                        }, stepBody);
                        steps.push(stepElement);
                    }
                }
            }
            let list = h('ul', {
                "class": "list-group list-group-numbered"
            }, steps);
            let header = h('h1', {
                "class": "display-6 text-light"
            }, "Crafting Guide");
            //wrap it up in hidden div
            return h("div", {
                "class": "container d-none"
            }, header, list);
        }
    };
</script>