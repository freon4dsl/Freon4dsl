import * as React from 'react';
import { Flex, Image, Box } from '@fluentui/react-northstar';
import { Navigator } from "./Navigator";
import { ErrorList } from "./ErrorList";

// This component holds the navigator to the left side, and
// the editor and errorlist to the right.
// The editor and errolist are layed out vertically.

export const EditorArea: React.FunctionComponent = () => {
  return (
      <Flex fill={true} hAlign="stretch">
          <Flex.Item size="20%" flexDirection="row" >
              <Box
                  // content="navigator"
                  styles={{
                      border: '2px solid #ccc',
                      color: 'blue',
                      ':hover': {
                          color: 'red',
                      },
                  }}>
                  <Navigator />
              </Box>
          </Flex.Item>
          <Flex.Item >
              <Flex column={true} fill={true} hAlign="stretch" vAlign="stretch">
                  <Flex.Item size="size.large">
                      <Box
                          styles={{
                              border: '2px solid #ccc',
                              color: 'blue',
                              height: '400px',
                              width: '100%',
                              minheight: '500px',
                              // maxheight: '500px',
                              ':hover': {
                                  color: 'red',
                              },
                          }}>
                          <Image src="editor-screenshot-april-6-2020.png" alt="editor"/>
                      </Box>
                  </Flex.Item>
                  <Flex.Item size="size.quarter">
                      <Box
                          // content="errorList"
                          styles={{
                              // border: '2px solid #ccc',
                              color: 'blue',
                              // minheight: '100px',
                              maxheight: '100px',
                              ':hover': {
                                  color: 'red',
                              },
                          }}>
                          <ErrorList />
                      </Box>
                  </Flex.Item>
              </Flex>
          </Flex.Item>
      </Flex>
  );
};
