import { observer } from "mobx-react";
import * as React from "react";
import { STYLES } from "@projectit/core";

import { MainToolbarItemComponent } from "./MainToolbarItemComponent";

export interface MainToolbarItem {
  id: string;
  label: string;
  onClick: () => void;
}

export type MainProps = {
  toolbarItems: MainToolbarItem[];
};

@observer
export class MainToolbarComponent extends React.Component<MainProps, {}> {
  render() {
    return (
      <div>
        <div className={STYLES.toolbar}>
          {this.props.toolbarItems.map(item => {
            return (
              <MainToolbarItemComponent key={item.id} toolbarItem={item} />
            );
          })}
        </div>
      </div>
    );
  }
}
