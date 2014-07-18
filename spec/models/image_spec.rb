require 'spec_helper'

describe Image do
  it { should respond_to :environment }

  describe '#id' do
    it { should respond_to :id }
  end

  describe '#category' do
    it { should respond_to :category }
  end

  describe '#name' do
    it { should respond_to :name }
  end

  describe '#source' do
    it { should respond_to :source }
  end

  describe '#description' do
    it { should respond_to :description }
  end

  describe '#type' do
    it { should respond_to :type }
  end

  describe '#expose' do
    it { should respond_to :expose }
  end

  describe '#volumes' do
    it { should respond_to :volumes }
  end

  describe '#command' do
    it { should respond_to :command }
  end

  describe '#required_fields_missing?' do

    it 'returns true if all required fields are satisfied' do
      subject.environment = [
        Environment.new('variable' => 'PORT', 'value' => '80', 'required' => true),
        Environment.new('variable' => 'OPTIONAL', 'value' => ''),
        Environment.new('variable' => 'ANOTHER_OPTIONAL', 'required' => '')
      ]

      expect(subject.required_fields_missing?).to be_false
    end

    it 'returns true if there are no required fields' do
      subject.environment = [
        Environment.new('variable' => 'OPTIONAL', 'value' => ''),
        Environment.new('variable' => 'ANOTHER_OPTIONAL')
      ]

      expect(subject.required_fields_missing?).to be_false
    end

    it 'returns false if a required field is blank' do
      subject.environment = [
        Environment.new('variable' => 'OPTIONAL', 'value' => ''),
        Environment.new('variable' => 'PORT', 'value' => '', 'required' => true),
        Environment.new('variable' => 'ANOTHER_OPTIONAL')
      ]

      expect(subject.required_fields_missing?).to be_true
    end

    it 'returns false if a required field is missing' do
      subject.environment = [
        Environment.new('variable' => 'OPTIONAL', 'value' => ''),
        Environment.new('variable' => 'PORT', 'required' => true),
        Environment.new('variable' => 'ANOTHER_OPTIONAL')
      ]

      expect(subject.required_fields_missing?).to be_true
    end
  end

  describe '#environment_attributes=' do
    it 'assigns environment to the values of the passed in attrs' do
      var_1 = { 'variable' => 'booh', 'value' => 'yah' }
      var_2 = { 'variable' => 'GIT_REPO', 'value' => 'bla.git' }
      subject.environment_attributes = {
        '0' => var_1,
        '1' => var_2
      }
      expect(subject.environment).to match_array [var_1, var_2]
    end
  end

  describe '#docker_index_url' do
    it 'composes a docker index URL' do
      subject.source = 'supercool/repository'
      expect(subject.docker_index_url).to eq "#{DOCKER_INDEX_BASE_URL}u/supercool/repository"
    end
  end

  describe '#base_image_name' do
    it 'returns the base image name without any tag information' do
      subject.source = 'supercool/repository:foobar'
      expect(subject.base_image_name).to eq 'supercool/repository'
    end
  end

  describe '#icon' do
    context 'an icon was provided by the image' do
      it 'returns the URL of the image icon' do
        subject.type = 'wordpress'
        expect(subject.icon).to eq '/assets/type_icons/wordpress.svg'
      end
    end

    context 'no icon is specified' do
      it 'returns the URL of the default icon' do
        subject.type = nil
        expect(subject.icon).to eq '/assets/type_icons/default.svg'
      end
    end

  end

end
