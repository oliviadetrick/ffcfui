<template>
    <div class="container">
        <h1 class="display-6 text-light">Diagram</h1>
        <div class="d-flex justify-content-center">
            <div class="container">
                <div class="svg-container" />
            </div>
        </div>
    </div>
</template>

<script>
    import { create, format, scaleOrdinal, schemeSet3 } from "d3";
    import { sankey, sankeyLeft, sankeyLinkHorizontal } from "d3-sankey";
    import { toRaw } from "vue";

    export default {
        name: "CraftingDiagram",
        props: {
            align: {
                type: Function,
                default: sankeyLeft,
            },
            color: {
                type: Function,
                default: (function() {
                    const color = scaleOrdinal(schemeSet3);
                    return d => color(d.Name);
                })(),
            },
            combineNodes: {
                type: Boolean,
                default: false,
            },
            format: {
                type: Function,
                default: format(",.0f"),
            },
            height: {
                type: Number,
                default: 400,
            },
            links: Array,
            nodes: Array,
            width: {
                type: Number,
                default: 900,
            },
        },
        computed: {
            sankey: function() {
                return sankey()
                    .nodeId(d => d.ItemID)
                    .nodeWidth(20)
                    .nodePadding(10)
                    .extent([
                        [1, 5],
                        [this.width - 1, this.height - 5],
                    ])
                    .nodeAlign(this.align);
            },
        },
        methods: {
            generateSvg: function() {
                if (this.nodes.length > 0) {
                    const svg = create("svg").attr("viewBox", [
                        0,
                        0,
                        this.width,
                        this.height,
                    ]);
                    let data = {
                        nodes: toRaw(this.nodes),
                        links: toRaw(this.links),
                    };
                    let graph = this.sankey(data);
                    //merge like crafting
                    if (this.combineNodes) {
                        let links = {};
                        let redundant = [];
                        for (let i = 0; i < graph.nodes.length; i++) {
                            let item = graph.nodes[i];
                            if (item.ItemID < 0) {
                                let key = `${item.Name}_${item.depth}`;
                                if (typeof links[key] === "object") {
                                    for (
                                        let j = 0;
                                        j < graph.links.length;
                                        j++
                                    ) {
                                        let item2 = graph.links[j];
                                        if (
                                            item2.source.ItemID === item.ItemID
                                        ) {
                                            redundant.push(item.ItemID);
                                            item2.source = links[key].ItemID;
                                        }
                                        if (
                                            item2.target.ItemID === item.ItemID
                                        ) {
                                            redundant.push(item.ItemID);
                                            item2.target = links[key].ItemID;
                                        }
                                    }
                                } else {
                                    links[key] = item;
                                }
                            }
                        }
                        if (redundant.length > 0) {
                            new Set(redundant).forEach(id => {
                                let i = graph.nodes.findIndex(
                                    n => n.ItemID === id
                                );
                                if (i >= 0) {
                                    graph.nodes.splice(i, 1);
                                }
                            });
                            graph = this.sankey(graph);
                        }
                    }
                    svg.append("g")
                        .selectAll("rect")
                        .data(graph.nodes)
                        .join("rect")
                        .attr("class", "s-node")
                        .attr("x", d => d.x0)
                        .attr("y", d => d.y0)
                        .attr("height", d => d.y1 - d.y0)
                        .attr("width", d => d.x1 - d.x0)
                        .attr("fill", this.color)
                        .append("title")
                        .text(d =>
                            d.ItemID >= 0 ? `${d.Name} x${d.value}` : d.Name
                        );

                    const link = svg
                        .append("g")
                        .attr("fill", "none")
                        .attr("stroke-opacity", 0.5)
                        .selectAll("g")
                        .data(graph.links)
                        .join("g");
                    link.append("path")
                        .attr("d", sankeyLinkHorizontal())
                        .attr("class", "s-link")
                        .attr("stroke", d => this.color(d.source))
                        .attr("stroke-width", d => Math.max(1, d.width));
                    link.append("title").text(d =>
                        d.source.ItemID >= 0
                            ? `${d.source.Name} x${d.value} → ${d.target.Name}`
                            : `${d.source.Name} → ${d.target.Name} x${d.target.value}`
                    );

                    svg.append("g")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", 10)
                        .selectAll("text")
                        .data(graph.nodes)
                        .join("text")
                        .attr("x", d =>
                            d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6
                        )
                        .attr("y", d => (d.y1 + d.y0) / 2)
                        .attr("dy", "0.35em")
                        .attr("fill", "#FFF")
                        .attr("text-anchor", d =>
                            d.x0 < this.width / 2 ? "start" : "end"
                        )
                        .text(d => `${d.Name}`);
                    return svg.node();
                }
                return null;
            }
        },
        watch: {
            nodes: {
                deep: true,
                handler() {
                    let svg = this.generateSvg();
                    let el = this.$el.getElementsByClassName(
                        "svg-container"
                    )[0];
                    el.innerHTML = "";
                    el.append(svg);
                },
            },
        },
    };
</script>

<style>
.s-link {
    fill: none;
    stroke: #FFF;
    stroke-opacity: .2;
}
.s-link:hover {
    stroke-opacity: .5 !important;
}
</style>