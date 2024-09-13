Some projections cannot be parsed. For instance,

concept RefsWithSeparator {
    partList: WithDirectRefs[];
    optList: WithDirectRefs[];
}

RefsWithSeparator {
    [
    ${self.partList separator [!]}
    [?${self.optList separator [#]}]
    ]
}
