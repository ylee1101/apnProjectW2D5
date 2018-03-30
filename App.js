import React from "react";
import {
  NetInfo,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight
} from "react-native";
import NavigationBar from "react-native-navbar";
// import Storage from "react-native-storage";

// we seperate the two json arrays sections starting with drawpage and fillpage
const newSetArr = [];

const filterNewSetArr = array => {
  return array.filter(element => element[0] === "drawpage");
};

const matchPage = (array1, array2) => {
  return array1.map(page => {
    page.elements = array2.filter(
      element => element[1] === page[1] && element[0] === "fillpage"
    );
    return page;
  });
};

// using asynchronosly fetches json data and hold for other functions
async function getData() {
  // try {
    const data = await fetch(
      "https://devccc.assuredperformance.net/react_test.php"
    );
    return await data.json();
  // } catch (err) {
    // console.log("Fetch Failed", err);
  // }
}

// we need to save the data
// async function saveData() {

// }

// we need to get the local data
// async function getLocalData() {

// }

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // onLoading: false,
      page: null,
      pageIndex: [],
      stored: false,
      isConnected: false,
      ready: false
    };
  }

  // LOCAL STORAGE SECTION STARTS - _updateData to grable the listOdDatas key from local
  // async _updateData() {
  //   try {
  //     let response = await AsyncStorage.getItem("listOfDatas");
  //     let listOfDatas = (await JSON.parse(response)) || [];

  //     this.setState({ listOfDatas });
  //   } catch (err) {
  //     console.log("Updating Data Failed", err);
  //   }
  // }
  // LOCAL STORAGE SECTION ENDS

  // /\d+/g -> any digit from 0 to 9 repeated one or more times (+) The qualifier g will make the search global (ie: don't stop on the first hit)
  componentWillMount() {
    NetInfo.getConnectionInfo()
      .then(connectionInfo => {
        const connectStatus = connectionInfo.type !== "none";
        this.setState({ isConnected: connectStatus });
        // console.log(this.state.isConnected)
      })
      // .then(() => console.log('Are we on:' + this.state.isConnected))
      .then(() =>
        NetInfo.isConnected.addEventListener(
          "connectionChange",
          this.handleConnectivityChange
        )
      )
      .then(() => AsyncStorage.getItem("stored"))
      .then(value => {
        if (value) {
          this.setState({ stored: value });
        } else {
          this.setState({ stored: false });
        }
      })
      .then(() => {
        if (this.state.isConnected) {
          getData()
            .then(data => data.map(element => newSetArr.push(element)))
            // .then(res => console.log("Testing: res", res)) //res = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            .then(res => filterNewSetArr(newSetArr))
            .then(res => matchPage(res, newSetArr))
            .then(res => this.setState({ pageIndex: res }))
            .then(() =>
              AsyncStorage.setItem(
                "pageIndex",
                JSON.stringify(newSetArr)
              )
            )
            .then(() => AsyncStorage.setItem("stored", "true"))
            .then(() => this.setState({ stored: true }))
            .then(() =>
              this.setState({
                page: parseInt(this.state.pageIndex[0][1].match(/\d+/g) - 1, 10)
              })
            )
            .then(() => this.setState({ ready: true }));
        } else if (this.state.stored && !this.state.isConnected) {
          AsyncStorage.getItem("pageIndex")
            .then(req => JSON.parse(req))
            .then(data =>
              data.map(element => newSetArr.push(element))
            )
            .then(() => filterNewSetArr(newSetArr))
            .then(res => matchPage(res, newSetArr))
            // .then(req => console.log("req testing"))
            .then(res => this.setState({ pageIndex: res }))
            .then(() =>
              this.setState({ page: parseInt(this.state.pageIndex[0][1].match(/\d+/g)-1, 10)})
            )
            .then(() => this.setState({ ready: true }))
            .catch(error => console.log("error!"));
        } else {
          alert("Please connect to the internet");
        }
      })
      .catch(err => alert(err.message));
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
      "connectionChange",
      this.handleConnectivityChange
    );
  }

  handleConnectivityChange = isConnected => {
    if (isConnected) {
      this.setState({ isConnected: isConnected });
    } else {
      this.setState({ isConnected: isConnected });
    }
  };

  // we can put the button text or whatever the functionalities that we want to put to be displayed
  fillPage = element => {
    let item = element[2];
    // console.log("testing element: ", element);
    switch (item) {
      case "button":
        return (
          <View
            Key={element[3]}
            style={{
              position: "relative",
              justifyContent: "flex-start",
              flexDirection: "column",
              position: "relative"
            }}
          >
            <TouchableHighlight
              key={element[3]}
              onPress={() => {
                element[4] === "disabled"
                  ? console.log("your going nowhere")
                  : this.setState({
                      page: parseInt(element[5].match(/\d+/g) - 1, 10)
                    });
              }}
              style={{
                backgroundColor: "#003D50",
                padding: 20,
                borderRadius: 20,
                margin: 10,
                width: 130
              }}
            >
              <Text
                style={{ fontSize: 18, color: "#E6E7E8", textAlign: "center" }}
              >
                {element[3]}
              </Text>
            </TouchableHighlight>
          </View>
        );
      case "echo":
        return (
          <Text
            key={element[3]}
            style={{ fontSize: 20, textAlign: "center", marginTop: 40 }}
          >
            {element[3]}!
          </Text>
        );
      default:
        return <Text>{element[3]}</Text>;
    }
  };

  // top navigator buttons starts here
  rightButtonConfig = {
    title: "Next",
    tintColor: "#E6E7E8",
    handler: () => {
      if (this.state.page == this.state.pageIndex.length - 1) {
        return;
      } else {
        this.setState({
          page: this.state.page + 1
        });
      }
    }
  };

  // we need to hide this button when its at homeScreen
  leftButtonConfig = {
    title: "Back",
    tintColor: "#FEFFFE",
    handler: () => {
      if (this.state.page === 0) {
        return;
      } else {
        this.setState({
          page: this.state.page - 1
        });
      }
    }
  };
  // top navigator buttons ends here

  // Title text section starts here
  titleConfig = {
    title: "APN Project",
    tintColor: "#E6E7E8",
    style: { fontSize: 30 }
  };
  // Title text section ends here

  render() {
    // console.log("testing: this.state.page: ", this.state.page);
    // console.log("testing this.state.pageIndex : ", this.state.pageIndex);
    // console.log("testing this.state.stored : ", this.state.stored)
    if (!this.state.ready) {
      return <Text>Please wait, it's loading</Text>;
    } else {
      return (
        <View style={styles.container}>
          <NavigationBar
            style={styles.navbar}
            tintColor="#092140"
            title={this.titleConfig}
            leftButton={this.leftButtonConfig}
            rightButton={this.rightButtonConfig}
          />
          <View style={styles.buttonContainer}>
            {this.state.pageIndex[this.state.page].elements.map(item =>
              this.fillPage(item)
            )}
          </View>
        </View>
      );
    }
  }
}

const styles = {
  container: {
    flex: 1
  },
  buttonContainer: {
    flexWrap: "wrap",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50
  },
  navbar: {
    marginTop: 25,
    marginBottom: 25
  }
};
