import React, { Component } from "react";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeItem } from "@mui/lab";

class Department extends Component {
  isChild =
    (prefix) =>
    ({ departmentId }) =>
      departmentId.startsWith(prefix) &&
      /^[^\/]*\/$/.test(departmentId.slice(prefix.length));

  nest = (xs, prefix = "") =>
    xs.filter(this.isChild(prefix)).map((x) => ({
      ...x,
      children: this.nest(xs, x.departmentId),
    }));

  getTreeItems(nodes) {
    return (
      <TreeItem
        key={nodes.id}
        nodeId={nodes.departmentId}
        label={nodes.name}
        onClick={() =>
          this.props.onClick({
            id: nodes.id,
            departmentId: nodes.departmentId,
            name: nodes.name,
          })
        }
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((node) => this.getTreeItems(node))
          : null}
      </TreeItem>
    );
  }

  render() {
    /*const test = [
      { id: 1, hierarchyid: "/", level: 0, name: "Mhz" },
      { id: 2, hierarchyid: "/2/", level: 1, name: "SMT" },
      { id: 3, hierarchyid: "/3/", level: 1, name: "QC" },
      { id: 4, hierarchyid: "/3/4/", level: 2, name: "Tester" },
      { id: 5, hierarchyid: "/3/5/", level: 2, name: "Operator" },
    ];*/

    const data = this.nest(this.props.data);

    return (
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ height: "auto", flexGrow: 1, width: "auto", overflowY: "auto" }}
      >
        {data.length > 0 && this.getTreeItems(data[0])}
      </TreeView>
    );
  }
}

export default Department;
