import 'dart:js';
import 'dart:html';

void main() {
  querySelector('#output').text = 'Your Dart app is running.';
  print("Hello World!!!");
  context["alert"] = (dynamic s){
    print(s);
  };
}
