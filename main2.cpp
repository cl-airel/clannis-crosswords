#include <iostream>
#include <string>

int main() {
    std::string name;
    std::cout << "Welcome, adventurer! What is your name? ";
    std::cin >> name;
    std::cout << "Hello, " << name << "! Your journey begins now...\n";
    return 0;
}